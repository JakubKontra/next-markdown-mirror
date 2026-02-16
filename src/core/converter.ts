import { parseHTML } from 'linkedom';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

import type { ConversionResult, MarkdownMirrorConfig } from './types.js';
import { extractContent } from './content-extractor.js';
import { filterContent } from './content-filter.js';
import { extractJsonLd } from './jsonld-extractor.js';
import { countTokens } from './token-counter.js';
import { registerCustomRules } from './turndown-plugins.js';

const DEFAULT_MAX_CONTENT_SIZE = 1_048_576; // 1MB

/**
 * Main HTML→Markdown converter.
 */
export class HtmlToMarkdown {
  private config: MarkdownMirrorConfig;

  constructor(config: MarkdownMirrorConfig = {}) {
    this.config = config;
  }

  /**
   * Convert an HTML string to Markdown.
   */
  convert(html: string): ConversionResult {
    const maxSize = this.config.maxContentSize ?? DEFAULT_MAX_CONTENT_SIZE;
    if (html.length > maxSize) {
      throw new Error(`Content size ${html.length} exceeds maximum ${maxSize} bytes`);
    }

    // Parse HTML
    const { document } = parseHTML(html);

    // Extract JSON-LD before filtering (scripts get removed)
    let frontmatter = '';
    let jsonLdData: Record<string, unknown>[] | undefined;
    if (this.config.extractJsonLd !== false) {
      const jsonLd = extractJsonLd(document);
      if (jsonLd.data.length > 0) {
        frontmatter = jsonLd.frontmatter;
        jsonLdData = jsonLd.data;
      }
    }

    // Extract title
    const titleEl = document.querySelector('title');
    const title = titleEl?.textContent?.trim() || undefined;

    // Find main content
    const contentEl = extractContent(document, this.config.contentSelectors) as Element;

    if (!contentEl) {
      return {
        markdown: frontmatter || '',
        tokenCount: 0,
        jsonLd: jsonLdData,
        title,
      };
    }

    // Clone content so filtering doesn't affect the original
    const clone = contentEl.cloneNode(true) as Element;

    // Filter non-content elements
    filterContent(clone as unknown as Parameters<typeof filterContent>[0], {
      excludeSelectors: this.config.excludeSelectors,
      includeSelectors: this.config.includeSelectors,
    });

    // Resolve relative URLs
    if (this.config.baseUrl) {
      this.resolveUrls(
        clone as unknown as {
          querySelectorAll(s: string): ArrayLike<Element>;
        },
        this.config.baseUrl,
      );
    }

    // Set up Turndown
    const turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      emDelimiter: '*',
      ...this.config.turndownOptions,
    });

    // Add GFM plugin (tables, strikethrough, task lists)
    turndown.use(gfm);

    // Add custom rules
    registerCustomRules(turndown);

    // Add user-provided custom rules
    if (this.config.turndownRules) {
      for (const [name, rule] of Object.entries(this.config.turndownRules)) {
        turndown.addRule(name, rule);
      }
    }

    // Convert to Markdown
    const outerHTML =
      (clone as unknown as { outerHTML?: string }).outerHTML ??
      (clone as unknown as { innerHTML?: string }).innerHTML ??
      '';
    let markdown = turndown.turndown(outerHTML);

    // Clean up excessive whitespace
    markdown = cleanMarkdown(markdown);

    // Add frontmatter
    const fullMarkdown = frontmatter + markdown;

    // Count tokens
    const tokenFn = this.config.tokenCounter ?? countTokens;
    const tokenCount = tokenFn(fullMarkdown);

    return {
      markdown: fullMarkdown,
      tokenCount,
      jsonLd: jsonLdData,
      title,
    };
  }

  private resolveUrls(
    root: { querySelectorAll(s: string): ArrayLike<Element> },
    baseUrl: string,
  ): void {
    // Resolve <a href>
    const links = root.querySelectorAll('a[href]');
    for (let i = 0; i < links.length; i++) {
      const href = links[i].getAttribute('href');
      if (href && !isAbsoluteUrl(href)) {
        try {
          links[i].setAttribute('href', new URL(href, baseUrl).href);
        } catch {
          // Skip invalid URLs
        }
      }
    }

    // Resolve <img src>
    const imgs = root.querySelectorAll('img[src]');
    for (let i = 0; i < imgs.length; i++) {
      const src = imgs[i].getAttribute('src');
      if (src && !isAbsoluteUrl(src)) {
        try {
          imgs[i].setAttribute('src', new URL(src, baseUrl).href);
        } catch {
          // Skip invalid URLs
        }
      }
    }
  }
}

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//.test(url) || url.startsWith('//') || url.startsWith('data:');
}

function cleanMarkdown(md: string): string {
  return (
    md
      // Collapse 3+ blank lines to 2
      .replace(/\n{3,}/g, '\n\n')
      // Remove trailing whitespace on lines
      .replace(/[ \t]+$/gm, '')
      // Ensure single trailing newline
      .trim() + '\n'
  );
}
