# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-03-04

### Added

- **Pages Router support** — new `next-markdown-mirror/pages` entry point with full support for Next.js Pages Router (`pages/` directory)
  - `createMarkdownMiddleware()` — middleware that detects markdown requests and rewrites to `/api/md-mirror/...`
  - `createPagesMarkdownHandler()` — API route handler for `pages/api/md-mirror/[...path].ts`
  - `createPagesLlmsTxtHandler()` / `createPagesLlmsFullTxtHandler()` — API route handlers for llms.txt generation
- Pages Router test coverage (22 tests across middleware, API route handler, and llms API route)

## [1.0.1] - 2026-02-24

### Added

- Documentation site (Docusaurus) with GitHub Pages deployment
- Bun support in install tabs

### Changed

- Default route prefix from `/_md` to `/md-mirror`
- Bumped to stable v1.0 release

## [0.1.0] - 2025-06-15

### Added

- **Core converter** (`HtmlToMarkdown`) — converts HTML to clean Markdown with configurable content selectors, exclude/include filters, and custom Turndown rules
- **JSON-LD extraction** — extracts structured data from `<script type="application/ld+json">` and prepends as YAML frontmatter
- **Token counting** — heuristic token counter with support for custom token counter functions
- **Built-in content filtering** — strips navs, footers, sidebars, ads, cookie banners, scripts, styles, and other non-content elements
- **GFM support** — tables, strikethrough, autolinks, and task lists via `turndown-plugin-gfm`
- **Extended Markdown conversions** — definition lists (`<dl>`), `<details>`/`<summary>`, `<mark>`, `<abbr>`, `<figure>`/`<figcaption>`, `<sub>`/`<sup>`
- **`llms.txt` generator** — generates [llms.txt](https://llmstxt.org/) files from page lists or sitemap URLs
- **Next.js 16 proxy** — intercepts `Accept: text/markdown` and `?v=md` requests and rewrites them to the markdown route handler
- **Next.js 16 route handler** — `createMarkdownHandler()` for serving converted Markdown from `app/md-mirror/[...path]/route.ts`
- **Response headers** — `Content-Type: text/markdown`, `Vary: Accept`, `x-markdown-tokens`, and configurable `Content-Signal`
- **Framework-agnostic core** — converter works standalone without Next.js dependency
