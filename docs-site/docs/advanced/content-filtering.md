---
sidebar_position: 2
title: Content Filtering
description: Control what gets included in and excluded from Markdown output.
---

# Content Filtering

next-markdown-mirror aggressively filters non-content elements to give AI agents clean, focused Markdown. Here's how the filtering works and how to customize it.

## Built-in filtering

By default, these elements are stripped before conversion:

### Tags removed

`nav`, `footer`, `header`, `form`, `script`, `style`, `noscript`, `iframe`, `svg`, `canvas`, `template`

### Selectors removed

| Selector | Reason |
|----------|--------|
| `[data-md-skip]` | Explicit opt-out attribute |
| `[aria-hidden="true"]` | Hidden from assistive tech |
| `.sr-only` | Screen-reader only content |
| `.visually-hidden` | Visually hidden content |
| `button` | Interactive element |
| `input` | Form element |
| `select` | Form element |
| `textarea` | Form element |

### Images filtered

Icons and small images (smaller than 50x50px based on `width`/`height` attributes) are removed to reduce noise.

## The `data-md-skip` attribute

The simplest way to exclude a specific element from Markdown output is to add `data-md-skip` to it:

```html
<div class="sidebar" data-md-skip>
  <!-- This entire div will be excluded from Markdown -->
</div>
```

This works regardless of any other configuration. It's useful for excluding elements that are part of the main content area but shouldn't appear in the Markdown output (e.g., share buttons, related posts widgets).

## contentSelectors

The `contentSelectors` option controls which part of the page is treated as the main content. Selectors are tried in order — the first match is used.

Default selectors:

```ts
['main', 'article', '[role="main"]', '.content', '.post', '#content', '#main']
```

If none match, the full `<body>` is used.

### Example: target a specific container

```ts
export const GET = createMarkdownHandler({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  contentSelectors: ['.docs-content', '.blog-post', 'article'],
});
```

The converter will look for `.docs-content` first, then `.blog-post`, then `article`. This is useful when your site has different layouts for different page types.

## excludeSelectors

Add additional CSS selectors for elements to remove. These are applied **on top of** the built-in exclusions.

```ts
export const GET = createMarkdownHandler({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  excludeSelectors: [
    '.sidebar',
    '.table-of-contents',
    '.breadcrumbs',
    '.comments-section',
    '.newsletter-signup',
  ],
});
```

## includeSelectors

Force-include elements that would otherwise be excluded by the built-in filters. Include selectors take priority over exclude selectors.

```ts
export const GET = createMarkdownHandler({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  excludeSelectors: ['.sidebar'],
  includeSelectors: ['.sidebar .code-example'],
});
```

In this example, the sidebar is excluded, but any `.code-example` inside the sidebar is preserved.

## Combining selectors

The filtering pipeline runs in this order:

1. **contentSelectors** — find the main content area
2. **Built-in exclusions** — remove known non-content tags and selectors
3. **excludeSelectors** — remove additional elements you specified
4. **includeSelectors** — re-include elements that were excluded but should be kept

### Example: blog with sidebar

```ts
export const GET = createMarkdownHandler({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  // Only look at the article content
  contentSelectors: ['article.blog-post'],
  // Remove extras within the article
  excludeSelectors: [
    '.author-bio',
    '.share-buttons',
    '.related-posts',
  ],
});
```

### Example: documentation site

```ts
export const GET = createMarkdownHandler({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  contentSelectors: ['.docs-content', 'main'],
  excludeSelectors: [
    '.toc',
    '.edit-on-github',
    '.prev-next-nav',
    '.feedback-widget',
  ],
  // Keep code blocks even if they're inside excluded areas
  includeSelectors: ['pre', '.code-group'],
});
```

## Using filterContent directly

For standalone usage outside of Next.js, you can call `filterContent` directly:

```ts
import { filterContent } from 'next-markdown-mirror';

const cleaned = filterContent(html, {
  exclude: ['.sidebar', '.ads'],
  include: ['pre'],
});
```

See [Standalone Usage](./standalone-usage.md) for more examples.
