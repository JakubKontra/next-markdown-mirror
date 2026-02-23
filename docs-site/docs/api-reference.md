---
sidebar_position: 4
title: API Reference
description: Complete API documentation for all exports.
---

# API Reference

next-markdown-mirror has two entry points: the core library and the Next.js integration.

## Core API — `next-markdown-mirror`

### HtmlToMarkdown

The main conversion class. Takes HTML and returns structured Markdown with metadata.

```ts
import { HtmlToMarkdown } from 'next-markdown-mirror';

const converter = new HtmlToMarkdown({
  contentSelectors: ['article', 'main'],
  extractJsonLd: true,
});

const result = converter.convert(html);
// result.markdown  — the converted Markdown string
// result.tokenCount — estimated token count
// result.jsonLd    — extracted JSON-LD objects (if enabled)
// result.title     — page title
```

**Constructor:** `new HtmlToMarkdown(config?: MarkdownMirrorConfig)`

**Method:** `convert(html: string): ConversionResult`

Returns a `ConversionResult`:

```ts
interface ConversionResult {
  markdown: string;
  tokenCount: number;
  jsonLd?: Record<string, unknown>[];
  title?: string;
}
```

---

### extractContent

Finds the main content area in an HTML document using priority-ordered selectors.

```ts
import { extractContent } from 'next-markdown-mirror';

const mainHtml = extractContent(html, ['article', '.post', 'main']);
```

**Signature:** `extractContent(html: string, selectors?: string[]): string`

Returns the inner HTML of the first matching selector, or the full `<body>` if none match.

---

### filterContent

Removes non-content elements from HTML.

```ts
import { filterContent } from 'next-markdown-mirror';

const cleaned = filterContent(html, {
  exclude: ['.sidebar', '.ads'],
  include: ['pre'],
});
```

**Signature:** `filterContent(html: string, config?: { exclude?: string[]; include?: string[] }): string`

---

### extractJsonLd

Extracts all JSON-LD structured data from `<script type="application/ld+json">` tags.

```ts
import { extractJsonLd } from 'next-markdown-mirror';

const schemas = extractJsonLd(html);
// [{ "@type": "Article", "headline": "..." }, ...]
```

**Signature:** `extractJsonLd(html: string): Record<string, unknown>[]`

---

### countTokens

Estimates the token count of a text string using whitespace-based splitting.

```ts
import { countTokens } from 'next-markdown-mirror';

const tokens = countTokens('Hello world, this is a test.');
```

**Signature:** `countTokens(text: string): number`

---

### registerCustomRules

Registers custom Turndown conversion rules on a TurndownService instance.

```ts
import TurndownService from 'turndown';
import { registerCustomRules } from 'next-markdown-mirror';

const service = new TurndownService();
registerCustomRules(service, {
  callout: {
    filter: (node) => node.classList.contains('callout'),
    replacement: (content, node) => `> **Note:** ${content}\n\n`,
  },
});
```

**Signature:** `registerCustomRules(service: TurndownService, rules: Record<string, TurndownService.Rule>): void`

---

### generateLlmsTxt

Generates an llms.txt file from a config. If `pages` is a sitemap URL string, it fetches and parses the sitemap.

```ts
import { generateLlmsTxt } from 'next-markdown-mirror';

const txt = await generateLlmsTxt({
  siteName: 'My Site',
  baseUrl: 'https://example.com',
  pages: [{ url: '/', title: 'Home' }],
});
```

**Signature:** `generateLlmsTxt(config: LlmsTxtConfig): Promise<string>`

---

### generateLlmsFullTxt

Same as `generateLlmsTxt` but generates the full-text variant with expanded page content.

```ts
import { generateLlmsFullTxt } from 'next-markdown-mirror';

const fullTxt = await generateLlmsFullTxt({
  siteName: 'My Site',
  baseUrl: 'https://example.com',
  pages: [{ url: '/', title: 'Home' }],
});
```

**Signature:** `generateLlmsFullTxt(config: LlmsTxtConfig): Promise<string>`

---

### parseSitemap

Fetches and parses a sitemap.xml URL into an array of `LlmsPage` objects.

```ts
import { parseSitemap } from 'next-markdown-mirror';

const pages = await parseSitemap(
  'https://example.com/sitemap.xml',
  'https://example.com'
);
// [{ url: '/about', title: 'About' }, ...]
```

**Signature:** `parseSitemap(sitemapUrl: string, baseUrl: string): Promise<LlmsPage[]>`

---

### isMarkdownRequest

Checks whether a request is asking for Markdown content (via Accept header or `?v=md` query parameter).

```ts
import { isMarkdownRequest } from 'next-markdown-mirror';

if (isMarkdownRequest(request)) {
  // serve Markdown
}
```

**Signature:** `isMarkdownRequest(request: Request): boolean`

---

## Next.js API — `next-markdown-mirror/nextjs`

### withMarkdownMirror

Creates a Next.js 16 proxy function that intercepts AI agent requests and rewrites them to the Markdown route handler.

```ts
import { withMarkdownMirror } from 'next-markdown-mirror/nextjs';

export const proxy = withMarkdownMirror({
  excludePaths: ['/api', '/admin'],
  routePrefix: '/md-mirror',
});
```

**Signature:** `withMarkdownMirror(config?: ProxyConfig): proxy function`

The returned function is exported as `proxy` from `proxy.ts` in your project root.

---

### createMarkdownHandler

Creates a Next.js route handler (GET) that converts pages to Markdown.

```ts
import { createMarkdownHandler } from 'next-markdown-mirror/nextjs';

export const GET = createMarkdownHandler({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  extractJsonLd: true,
});
```

**Signature:** `createMarkdownHandler(config: RouteHandlerConfig): GET handler`

---

### createLlmsTxtHandler

Creates a route handler that serves an llms.txt file.

```ts
import { createLlmsTxtHandler } from 'next-markdown-mirror/nextjs';

export const GET = createLlmsTxtHandler({
  siteName: 'My Site',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  pages: [{ url: '/', title: 'Home' }],
});
```

**Signature:** `createLlmsTxtHandler(config: LlmsTxtConfig): GET handler`

---

### createLlmsFullTxtHandler

Creates a route handler that serves an llms-full.txt file with expanded content.

```ts
import { createLlmsFullTxtHandler } from 'next-markdown-mirror/nextjs';

export const GET = createLlmsFullTxtHandler({
  siteName: 'My Site',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  pages: [{ url: '/', title: 'Home' }],
});
```

**Signature:** `createLlmsFullTxtHandler(config: LlmsTxtConfig): GET handler`

---

### buildMarkdownHeaders

Builds the response headers for a Markdown response.

```ts
import { buildMarkdownHeaders } from 'next-markdown-mirror/nextjs';

const headers = buildMarkdownHeaders(conversionResult, {
  contentSignal: 'search',
});
```

**Signature:** `buildMarkdownHeaders(result: ConversionResult, config?: { contentSignal?: ContentSignal }): Headers`

---

### Re-exports

The Next.js entry point also re-exports from the core:

- `HtmlToMarkdown`
- `isMarkdownRequest`

---

## Types

All types are exported from both entry points.

```ts
import type {
  MarkdownMirrorConfig,
  ConversionResult,
  LlmsPage,
  LlmsTxtConfig,
  ProxyConfig,
  RouteHandlerConfig,
  ContentSignal,
} from 'next-markdown-mirror';
```

See [Configuration](./configuration.md) for detailed descriptions of each type's fields.
