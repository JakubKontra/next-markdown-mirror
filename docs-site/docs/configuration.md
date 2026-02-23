---
sidebar_position: 3
title: Configuration
description: Complete reference for all configuration options.
---

# Configuration

This page covers every configuration option across the three main config objects.

## ProxyConfig

Passed to `withMarkdownMirror()` in `proxy.ts`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `routePrefix` | `string` | `"/md-mirror"` | URL prefix for the Markdown route handler. Must match the folder name in `app/`. |
| `excludePaths` | `string[]` | `[]` | Path prefixes to skip — requests to these paths pass through without interception. |

### Example

```ts title="proxy.ts"
import { withMarkdownMirror } from 'next-markdown-mirror/nextjs';

export const proxy = withMarkdownMirror({
  routePrefix: '/md-mirror',
  excludePaths: ['/api', '/admin', '/_next'],
});
```

## RouteHandlerConfig

Passed to `createMarkdownHandler()` in your route handler. Extends `MarkdownMirrorConfig` with additional options.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | **required** | The base URL of your site (e.g. `https://example.com`). Used to fetch pages internally. |
| `additionalHeaders` | `Record<string, string>` | `{}` | Extra headers to include in the internal fetch request (e.g. auth tokens). |

Plus all options from [MarkdownMirrorConfig](#markdownmirrorconfig) below.

### Example

```ts title="app/md-mirror/[...path]/route.ts"
import { createMarkdownHandler } from 'next-markdown-mirror/nextjs';

export const GET = createMarkdownHandler({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  contentSelectors: ['article', '.blog-post'],
  excludeSelectors: ['.sidebar', '.comments'],
  extractJsonLd: true,
  additionalHeaders: {
    'Cache-Control': 'public, max-age=3600',
  },
});
```

## MarkdownMirrorConfig

The core conversion configuration. Used by `RouteHandlerConfig` and the `HtmlToMarkdown` class.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `contentSelectors` | `string[]` | `["main", "article", "[role=\"main\"]", "#content", "#main-content", ".main-content", ".post-content", ".entry-content", ".article-content"]` | Priority-ordered CSS selectors to find the main content. The first match is used; falls back to `<body>`. |
| `excludeSelectors` | `string[]` | `[]` | Additional CSS selectors for elements to remove from content. Added on top of the built-in exclusions. |
| `includeSelectors` | `string[]` | `[]` | CSS selectors for elements to preserve even if they would normally be excluded. |
| `extractJsonLd` | `boolean` | `true` | Extract JSON-LD structured data from `<script type="application/ld+json">` tags and include as YAML frontmatter. |
| `turndownRules` | `Record<string, TurndownService.Rule>` | `{}` | Custom Turndown conversion rules. See [Custom Turndown Rules](./advanced/custom-rules.md). |
| `turndownOptions` | `TurndownService.Options` | `{}` | Override default Turndown options (heading style, bullet list marker, etc.). |
| `baseUrl` | `string` | `undefined` | Base URL for resolving relative links and images. |
| `maxContentSize` | `number` | `1048576` (1 MB) | Maximum HTML size in bytes before rejecting. Throws an error if exceeded. |
| `contentSignal` | `ContentSignal` | `undefined` | Sets the `Content-Signal` response header. One of `"ai-train"`, `"search"`, or `"ai-input"`. |
| `tokenCounter` | `(text: string) => number` | built-in | Custom function to count tokens. The built-in counter estimates based on whitespace splitting. |

### Content selectors example

```ts
export const GET = createMarkdownHandler({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  // Only look for content in these containers
  contentSelectors: ['.docs-content', 'article', 'main'],
  // Remove sidebars and table of contents
  excludeSelectors: ['.sidebar', '.toc', '.breadcrumbs'],
  // Keep code blocks even if they're inside excluded areas
  includeSelectors: ['pre', 'code'],
});
```

### Turndown options example

```ts
export const GET = createMarkdownHandler({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  turndownOptions: {
    headingStyle: 'atx',        // # Heading (default)
    bulletListMarker: '-',       // - item (default is *)
    codeBlockStyle: 'fenced',   // ```code``` (default)
    emDelimiter: '_',            // _emphasis_ (default is *)
  },
});
```

## LlmsTxtConfig

Passed to `createLlmsTxtHandler()` and `createLlmsFullTxtHandler()`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `siteName` | `string` | **required** | Your site's name. Appears as the title in llms.txt. |
| `baseUrl` | `string` | **required** | Base URL of your site. Used to build absolute page URLs. |
| `description` | `string` | `undefined` | A description of your site shown below the title. |
| `pages` | `LlmsPage[] \| string` | **required** | Array of page objects, or a URL string pointing to a sitemap.xml. |
| `sections` | `Record<string, { title: string; description?: string }>` | `undefined` | Group pages into named sections. Keys match the `section` field on `LlmsPage` objects. |

### LlmsPage object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | `string` | yes | Page path (e.g. `/about`). |
| `title` | `string` | yes | Page title shown in llms.txt. |
| `description` | `string` | no | Brief description of the page. |
| `section` | `string` | no | Section key this page belongs to. Must match a key in `sections`. |

### Example with sections

```ts title="app/llms.txt/route.ts"
import { createLlmsTxtHandler } from 'next-markdown-mirror/nextjs';

export const GET = createLlmsTxtHandler({
  siteName: 'My Docs',
  baseUrl: 'https://docs.example.com',
  description: 'Technical documentation for the Example API.',
  sections: {
    guides: { title: 'Guides', description: 'Step-by-step tutorials' },
    reference: { title: 'API Reference' },
  },
  pages: [
    { url: '/', title: 'Home', description: 'Welcome' },
    { url: '/quickstart', title: 'Quick Start', section: 'guides' },
    { url: '/authentication', title: 'Authentication', section: 'guides' },
    { url: '/endpoints', title: 'Endpoints', section: 'reference' },
    { url: '/errors', title: 'Error Codes', section: 'reference' },
  ],
});
```

See [llms.txt Protocol](./llms-txt.md) for more details including sitemap support and the full-text variant.
