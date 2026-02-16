import type TurndownService from 'turndown';

/**
 * Content signal values for the Content-Signal header.
 * Indicates how the content may be used by AI systems.
 */
export type ContentSignal = 'ai-train' | 'search' | 'ai-input';

/**
 * Configuration for the HTML→Markdown converter.
 */
export interface MarkdownMirrorConfig {
  /** Priority-ordered CSS selectors for finding main content. */
  contentSelectors?: string[];

  /** Additional CSS selectors to exclude from conversion. */
  excludeSelectors?: string[];

  /** CSS selectors to explicitly include (overrides excludes). */
  includeSelectors?: string[];

  /** Whether to extract JSON-LD and add as YAML frontmatter. Default: true */
  extractJsonLd?: boolean;

  /** Custom Turndown rules to add. */
  turndownRules?: Record<string, TurndownService.Rule>;

  /** Turndown options override. */
  turndownOptions?: TurndownService.Options;

  /** Base URL for resolving relative URLs in the HTML. */
  baseUrl?: string;

  /** Maximum content size in bytes before rejecting. Default: 1MB */
  maxContentSize?: number;

  /** Content-Signal header value. */
  contentSignal?: ContentSignal;

  /** Custom token counter function. Default: heuristic. */
  tokenCounter?: (text: string) => number;
}

/**
 * Result of HTML→Markdown conversion.
 */
export interface ConversionResult {
  /** The converted Markdown content (with optional YAML frontmatter). */
  markdown: string;

  /** Estimated token count. */
  tokenCount: number;

  /** Extracted JSON-LD data, if any. */
  jsonLd?: Record<string, unknown>[];

  /** The title extracted from the HTML, if found. */
  title?: string;
}

/**
 * A page entry for llms.txt generation.
 */
export interface LlmsPage {
  /** URL of the page. */
  url: string;

  /** Title of the page. */
  title: string;

  /** Optional description. */
  description?: string;

  /** Optional section grouping. */
  section?: string;
}

/**
 * Configuration for llms.txt generation.
 */
export interface LlmsTxtConfig {
  /** Name of the site. */
  siteName: string;

  /** Base URL of the site. */
  baseUrl: string;

  /** Site description for the header. */
  description?: string;

  /** Pages to include. Can be an array or a sitemap URL string. */
  pages: LlmsPage[] | string;

  /** Sections to organize pages into. */
  sections?: Record<string, { title: string; description?: string }>;
}

/**
 * Configuration for the Next.js proxy (withMarkdownMirror).
 */
export interface ProxyConfig {
  /** Paths to exclude from markdown rewriting (e.g. API routes, static). */
  excludePaths?: string[];

  /** The internal route prefix for markdown handler. Default: '/md-mirror' */
  routePrefix?: string;
}

/**
 * Configuration for the Next.js route handler.
 */
export interface RouteHandlerConfig extends MarkdownMirrorConfig {
  /** Base URL for internal fetch. Required. */
  baseUrl: string;

  /** Additional headers to pass to internal fetch. */
  additionalHeaders?: Record<string, string>;
}
