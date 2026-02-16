# next-markdown-mirror

[![npm version](https://img.shields.io/npm/v/next-markdown-mirror)](https://www.npmjs.com/package/next-markdown-mirror)
[![CI](https://github.com/jakubkontra/next-markdown-mirror/actions/workflows/ci.yml/badge.svg)](https://github.com/jakubkontra/next-markdown-mirror/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Self-hosted Markdown for AI agents** — serve Markdown instead of HTML when AI agents request it.

When an AI agent sends `Accept: text/markdown` or appends `?v=md`, next-markdown-mirror intercepts the request, converts your HTML page to clean Markdown (with JSON-LD frontmatter and token counts), and returns it. It also generates [`llms.txt`](https://llmstxt.org/) files for AI discovery.

Similar to [Cloudflare's Markdown conversion](https://developers.cloudflare.com/workers-ai/features/markdown-conversion/), but self-hosted and framework-integrated — no third-party dependency, full control over your content.

## How it works

```
                    ┌──────────────────────────────┐
                    │        Your Next.js App       │
                    │                               │
  Accept: text/md   │  ┌─────────┐                  │
  ─────────────────►│  │  proxy   │  rewrite         │
        or ?v=md    │  │  .ts     │──────────┐       │
                    │  └─────────┘           │       │
                    │                        ▼       │
                    │              ┌──────────────┐  │
                    │              │ /md-mirror/  │  │
                    │              │ [...path]    │  │  text/markdown
                    │              │  route.ts    │──┼──────────────►
                    │              └──────┬───────┘  │  + YAML frontmatter
                    │                     │          │  + token count
                    │           fetch     │          │
                    │          (internal) │          │
                    │                     ▼          │
                    │              ┌──────────────┐  │
                    │              │  Your HTML   │  │
                    │              │    page      │  │
                    │              └──────────────┘  │
                    └──────────────────────────────┘
```

## Quick Start

```bash
npm install next-markdown-mirror
```

### Next.js 16 setup (3 files)

**1. Proxy** — intercepts markdown requests and rewrites to the handler:

```ts
// proxy.ts
import { withMarkdownMirror } from 'next-markdown-mirror/nextjs';
export const proxy = withMarkdownMirror();
```

**2. Route handler** — fetches your HTML internally and converts to Markdown:

```ts
// app/md-mirror/[...path]/route.ts
import { createMarkdownHandler } from 'next-markdown-mirror/nextjs';

export const GET = createMarkdownHandler({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
});
```

**3. llms.txt** — AI discovery file:

```ts
// app/llms.txt/route.ts
import { createLlmsTxtHandler } from 'next-markdown-mirror/nextjs';

export const GET = createLlmsTxtHandler({
  siteName: 'My Site',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  pages: [
    { url: '/', title: 'Home', description: 'Welcome page' },
    { url: '/about', title: 'About' },
  ],
});
```

## Core API

The converter works standalone without Next.js:

```ts
import { HtmlToMarkdown } from 'next-markdown-mirror';

const converter = new HtmlToMarkdown({
  baseUrl: 'https://example.com',
  extractJsonLd: true,
  contentSignal: 'ai-input',
});

const result = converter.convert(html);
// result.markdown    — converted Markdown with YAML frontmatter
// result.tokenCount  — estimated token count
// result.jsonLd      — extracted JSON-LD data
// result.title       — page title
```

### llms.txt generation

```ts
import { generateLlmsTxt, parseSitemap } from 'next-markdown-mirror';

// From a page list
const txt = await generateLlmsTxt({
  siteName: 'My Site',
  baseUrl: 'https://example.com',
  pages: [{ url: '/about', title: 'About' }],
});

// From a sitemap
const pages = await parseSitemap('https://example.com/sitemap.xml', 'https://example.com');
```

## Configuration

### MarkdownMirrorConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `contentSelectors` | `string[]` | `['main', 'article', '[role="main"]']` | Priority-ordered CSS selectors for main content |
| `excludeSelectors` | `string[]` | `[]` | Additional CSS selectors to exclude |
| `includeSelectors` | `string[]` | `[]` | CSS selectors to explicitly include (overrides excludes) |
| `extractJsonLd` | `boolean` | `true` | Extract JSON-LD as YAML frontmatter |
| `turndownRules` | `Record<string, Rule>` | — | Custom Turndown conversion rules |
| `turndownOptions` | `TurndownService.Options` | — | Override Turndown options |
| `baseUrl` | `string` | — | Base URL for resolving relative URLs |
| `maxContentSize` | `number` | `1048576` (1MB) | Max HTML size before rejection |
| `contentSignal` | `ContentSignal` | — | `Content-Signal` header value |
| `tokenCounter` | `(text: string) => number` | heuristic | Custom token counter function |

### ProxyConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `excludePaths` | `string[]` | `[]` | Paths to exclude from rewriting (added to built-in excludes) |
| `routePrefix` | `string` | `'/md-mirror'` | Internal route prefix for the handler |

### RouteHandlerConfig

Extends `MarkdownMirrorConfig` with:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | **required** | Base URL for internal fetch |
| `additionalHeaders` | `Record<string, string>` | — | Extra headers for internal fetch |

## Response headers

| Header | Value | Description |
|--------|-------|-------------|
| `Content-Type` | `text/markdown; charset=utf-8` | Markdown MIME type |
| `Vary` | `Accept` | Indicates content negotiation |
| `x-markdown-tokens` | `number` | Estimated token count |
| `Content-Signal` | `ai-train \| search \| ai-input` | Optional — how AI may use the content |

## Testing with curl

```bash
# Via Accept header
curl -H "Accept: text/markdown" https://your-site.com/about

# Via query parameter
curl "https://your-site.com/about?v=md"

# Check token count
curl -sI -H "Accept: text/markdown" https://your-site.com/ | grep x-markdown-tokens
```

## Built-in content filtering

The converter automatically strips non-content elements:

- **Tags:** `<nav>`, `<footer>`, `<header>`, `<form>`, `<script>`, `<style>`, `<noscript>`, `<iframe>`, `<svg>`, `<canvas>`, `<template>`
- **Selectors:** `[data-md-skip]`, `[aria-hidden="true"]`, `.sr-only`, `.visually-hidden`, `button`, `input`, `select`, `textarea`
- **Images:** Icons smaller than 50x50px (by `width`/`height` attributes)

Use `data-md-skip` on any element to exclude it from Markdown output.

## Special Markdown conversions

Beyond standard Markdown and GFM (tables, strikethrough, task lists), next-markdown-mirror converts:

| HTML | Markdown output |
|------|----------------|
| `<dl>`, `<dt>`, `<dd>` | `**Term**` / `: Definition` |
| `<details>` / `<summary>` | Preserved as HTML (`<details>`, `<summary>`) |
| `<mark>` | `==highlighted==` |
| `<abbr title="...">` | `Text (expansion)` |
| `<figure>` / `<figcaption>` | `![alt](src)` + `*caption*` |
| `<q>` | `"quoted text"` |
| `<sub>` / `<sup>` | `~subscript~` / `^superscript^` |

## Contributing

```bash
git clone https://github.com/jakubkontra/next-markdown-mirror.git
cd next-markdown-mirror
npm install
npm test          # run tests
npm run typecheck # type-check
npm run lint      # lint
npm run build     # build
cd test-app && npm install && npm run dev  # run test app on :3099
```

## Built with

Built with the help of [Claude Code](https://claude.ai/claude-code).

## License

[MIT](LICENSE)
