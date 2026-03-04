# next-markdown-mirror

[![npm version](https://img.shields.io/npm/v/next-markdown-mirror)](https://www.npmjs.com/package/next-markdown-mirror)
[![npm downloads](https://img.shields.io/npm/dm/next-markdown-mirror)](https://www.npmjs.com/package/next-markdown-mirror)
[![CI](https://github.com/jakubkontra/next-markdown-mirror/actions/workflows/ci.yml/badge.svg)](https://github.com/jakubkontra/next-markdown-mirror/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![NPM](https://nodei.co/npm/next-markdown-mirror.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/next-markdown-mirror)

**Self-hosted Markdown for AI agents** — serve clean Markdown instead of HTML when AI agents request your pages. [Full docs](https://jakubkontra.github.io/next-markdown-mirror/)

## The Problem

AI agents waste tokens parsing your nav bars, footers, cookie banners, and ad scripts as "content." HTML boilerplate can 2-5x the token count vs clean Markdown — and AI tools citing your site produce lower-quality responses because of the noise.

## Before / After

![demo](assets/demo.gif)

## Why not Cloudflare?

Cloudflare offers automatic Markdown conversion — but it requires their Pro plan at **$20/month per domain** ($240/year). For 5 domains, that's $1,200/year.

next-markdown-mirror is **free and open source**:

| | next-markdown-mirror | Cloudflare Pro |
|-|---------------------|----------------|
| 1 domain | **$0** | $240/year |
| 5 domains | **$0** | $1,200/year |
| 10 domains | **$0** | $2,400/year |

Plus: self-hosted (deploy anywhere), full control over filtering and frontmatter, built-in JSON-LD extraction and llms.txt support.

## Quick Start

Install:

```bash
pnpm add next-markdown-mirror
# or: yarn add next-markdown-mirror
# or: npm install next-markdown-mirror
# or: bun add next-markdown-mirror
```

### App Router setup (Next.js 16+, 3 files)

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

### Pages Router setup (3 files)

**1. Middleware** — intercepts markdown requests and rewrites to the API route:

```ts
// middleware.ts
import { createMarkdownMiddleware } from 'next-markdown-mirror/pages';
export default createMarkdownMiddleware();
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
```

**2. API route handler** — fetches your HTML internally and converts to Markdown:

```ts
// pages/api/md-mirror/[...path].ts
import { createPagesMarkdownHandler } from 'next-markdown-mirror/pages';

export default createPagesMarkdownHandler({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
});
```

**3. llms.txt** — AI discovery file:

```ts
// pages/api/llms.txt.ts
import { createPagesLlmsTxtHandler } from 'next-markdown-mirror/pages';

export default createPagesLlmsTxtHandler({
  siteName: 'My Site',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  pages: [
    { url: '/', title: 'Home', description: 'Welcome page' },
    { url: '/about', title: 'About' },
  ],
});
```

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

## Features

- **JSON-LD → YAML frontmatter** — structured data extracted and prepended automatically
- **[llms.txt](https://llmstxt.org/) protocol** — built-in AI discovery file generation
- **GFM + extended Markdown** — tables, task lists, definition lists, `<details>`, `<mark>`, and more
- **Token counting** — `x-markdown-tokens` response header with custom counter support
- **Intelligent content filtering** — strips nav, footer, scripts, ads, cookie banners, and icons
- **Content-Signal header** — tell AI agents how they may use your content

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

## Configuration

See the [full configuration reference](https://jakubkontra.github.io/next-markdown-mirror/docs/configuration) on the docs site.

### Key options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `contentSelectors` | `string[]` | `['main', 'article', '[role="main"]']` | CSS selectors for main content |
| `excludeSelectors` | `string[]` | `[]` | Additional CSS selectors to exclude |
| `extractJsonLd` | `boolean` | `true` | Extract JSON-LD as YAML frontmatter |
| `baseUrl` | `string` | — | Base URL for resolving relative URLs |
| `contentSignal` | `ContentSignal` | — | `Content-Signal` header value |
| `routePrefix` | `string` | `'/md-mirror'` (App Router) / `'/api/md-mirror'` (Pages Router) | Internal route prefix |

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
