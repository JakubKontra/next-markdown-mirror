import type { LlmsPage, LlmsTxtConfig } from './types.js';
import { HtmlToMarkdown } from './converter.js';

/**
 * Generate llms.txt content — an index of pages with markdown links.
 */
export async function generateLlmsTxt(config: LlmsTxtConfig): Promise<string> {
  const pages = await resolvePages(config);
  const lines: string[] = [];

  // Header
  lines.push(`# ${config.siteName}`);
  if (config.description) {
    lines.push('');
    lines.push(`> ${config.description}`);
  }
  lines.push('');

  // Group pages by section
  const grouped = groupBySection(pages, config);

  for (const [section, sectionPages] of Object.entries(grouped)) {
    if (section !== '_default') {
      const sectionMeta = config.sections?.[section];
      lines.push(`## ${sectionMeta?.title ?? section}`);
      if (sectionMeta?.description) {
        lines.push('');
        lines.push(`> ${sectionMeta.description}`);
      }
      lines.push('');
    }

    for (const page of sectionPages) {
      const desc = page.description ? `: ${page.description}` : '';
      lines.push(`- [${page.title}](${page.url})${desc}`);
    }
    lines.push('');
  }

  return lines.join('\n').trim() + '\n';
}

/**
 * Generate llms-full.txt content — full markdown of each page inlined.
 */
export async function generateLlmsFullTxt(
  config: LlmsTxtConfig,
  fetchFn: (url: string) => Promise<string>,
): Promise<string> {
  const pages = await resolvePages(config);
  const converter = new HtmlToMarkdown({ baseUrl: config.baseUrl });
  const sections: string[] = [];

  // Header
  sections.push(`# ${config.siteName}\n`);
  if (config.description) {
    sections.push(`> ${config.description}\n`);
  }

  for (const page of pages) {
    try {
      const html = await fetchFn(page.url);
      const result = converter.convert(html);
      sections.push(`---\n\n## ${page.title}\n\nSource: ${page.url}\n\n${result.markdown}`);
    } catch {
      sections.push(
        `---\n\n## ${page.title}\n\nSource: ${page.url}\n\n*Failed to convert this page.*\n`,
      );
    }
  }

  return sections.join('\n').trim() + '\n';
}

/**
 * Resolve pages from config — either use the array directly or fetch from sitemap.
 */
async function resolvePages(config: LlmsTxtConfig): Promise<LlmsPage[]> {
  if (Array.isArray(config.pages)) {
    return config.pages;
  }

  // Parse sitemap XML
  return parseSitemap(config.pages, config.baseUrl);
}

/**
 * Parse a sitemap XML and extract page URLs.
 */
export async function parseSitemap(sitemapUrl: string, baseUrl: string): Promise<LlmsPage[]> {
  const response = await fetch(sitemapUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`);
  }

  const xml = await response.text();
  const pages: LlmsPage[] = [];

  // Simple XML parsing for <url><loc>...</loc></url>
  const urlRegex =
    /<url>\s*<loc>(.*?)<\/loc>(?:\s*<lastmod>.*?<\/lastmod>)?(?:\s*<changefreq>.*?<\/changefreq>)?(?:\s*<priority>.*?<\/priority>)?\s*<\/url>/gs;
  let match: RegExpExecArray | null;

  while ((match = urlRegex.exec(xml)) !== null) {
    const url = match[1].trim();
    // Derive title from URL path
    const path = url.replace(baseUrl, '').replace(/\/$/, '') || '/';
    const title =
      path === '/'
        ? 'Home'
        : (path
            .split('/')
            .filter(Boolean)
            .pop()
            ?.replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()) ?? path);

    pages.push({ url, title });
  }

  return pages;
}

function groupBySection(pages: LlmsPage[], config: LlmsTxtConfig): Record<string, LlmsPage[]> {
  const groups: Record<string, LlmsPage[]> = {};

  for (const page of pages) {
    const section = page.section ?? '_default';
    if (!groups[section]) groups[section] = [];
    groups[section].push(page);
  }

  // If no custom sections, put everything under _default
  if (!config.sections) return groups;

  // Order: _default first, then configured sections in order
  const ordered: Record<string, LlmsPage[]> = {};
  if (groups['_default']) ordered['_default'] = groups['_default'];
  for (const key of Object.keys(config.sections)) {
    if (groups[key]) ordered[key] = groups[key];
  }
  // Include any remaining groups not in config.sections
  for (const [key, val] of Object.entries(groups)) {
    if (!ordered[key]) ordered[key] = val;
  }

  return ordered;
}
