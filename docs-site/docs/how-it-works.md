---
sidebar_position: 2
title: How It Works
description: Understand the request flow, detection logic, and content extraction pipeline.
---

# How It Works

## The problem

AI agents — ChatGPT, Claude, Perplexity, search crawlers — struggle with modern JavaScript-rendered sites. They receive a shell of HTML with empty `<div id="root">` tags or bloated markup full of navigation, ads, and scripts. The useful content is buried or absent entirely.

**next-markdown-mirror** solves this by intercepting AI agent requests and returning clean, structured Markdown with metadata — without changing anything for human visitors.

## Request flow

When an AI agent requests a page, here's what happens:

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

1. **Proxy** (`proxy.ts`) — checks if the request is from an AI agent
2. **Rewrite** — rewrites the URL to `/md-mirror/[...path]` transparently
3. **Route handler** — fetches the original page's HTML internally
4. **Convert** — extracts content, strips non-content elements, converts to Markdown
5. **Respond** — returns Markdown with frontmatter and response headers

Human visitors never see the `/md-mirror/` route. Their requests pass through the proxy untouched.

## Detection logic

A request is treated as an AI/Markdown request when either condition is true:

- The `Accept` header contains `text/markdown`
- The URL includes the query parameter `?v=md`

This is handled by the `isMarkdownRequest(request)` function, which you can also use directly.

## Content extraction pipeline

Once a request is identified as an AI request, the route handler runs this pipeline:

### 1. Fetch the HTML

The handler makes an internal HTTP request to your original page (using the `baseUrl` config) and retrieves the server-rendered HTML.

### 2. Find main content

The `extractContent` function locates the primary content using a priority-ordered list of selectors:

```
main, article, [role="main"], .content, .post, #content, #main
```

You can override these with the `contentSelectors` config option.

### 3. Filter non-content elements

The `filterContent` function strips elements that add noise for AI consumers:

**Tags removed:** `nav`, `footer`, `header`, `form`, `script`, `style`, `noscript`, `iframe`, `svg`, `canvas`, `template`

**Selectors removed:** `[data-md-skip]`, `[aria-hidden="true"]`, `.sr-only`, `.visually-hidden`, `button`, `input`, `select`, `textarea`

**Images filtered:** Icons smaller than 50x50px are removed.

You can customize this with `excludeSelectors` and `includeSelectors`. See [Content Filtering](./advanced/content-filtering.md) for details.

### 4. Convert to Markdown

The HTML is converted to Markdown using [Turndown](https://github.com/mixmark-io/turndown) with GFM (GitHub Flavored Markdown) support. Special HTML elements get custom conversions:

| HTML | Markdown |
|------|----------|
| `dl` / `dt` / `dd` | **Term** / : Definition |
| `details` / `summary` | Preserved as HTML |
| `mark` | `==highlighted==` |
| `abbr` | Text (expansion) |
| `figure` / `figcaption` | `![alt](src)` + *caption* |
| `q` | "quoted text" |
| `sub` / `sup` | `~subscript~` / `^superscript^` |

You can add your own rules via `turndownRules`. See [Custom Turndown Rules](./advanced/custom-rules.md).

### 5. Add frontmatter and metadata

The final Markdown response includes:

- **YAML frontmatter** with the page title and any JSON-LD structured data
- **Token count** — estimated token count for the content
- **Response headers** — see below

## Response headers

Every Markdown response includes these headers:

| Header | Value | Description |
|--------|-------|-------------|
| `Content-Type` | `text/markdown; charset=utf-8` | Markdown MIME type |
| `Vary` | `Accept` | Signals content negotiation to caches |
| `x-markdown-tokens` | number | Estimated token count |
| `Content-Signal` | `ai-train` / `search` / `ai-input` | Optional — see [Configuration](./configuration.md) |

## llms.txt protocol

In addition to per-page Markdown, you can serve an `llms.txt` file at your site root. This is a standardized discovery file that tells AI agents what pages are available and how to access them.

See [llms.txt Protocol](./llms-txt.md) for setup instructions.
