---
sidebar_position: 5
title: llms.txt Protocol
description: Set up AI discovery with the llms.txt protocol.
---

# llms.txt Protocol

The [llms.txt protocol](https://llmstxt.org/) is a standardized way for websites to tell AI agents what content is available and how to access it. Think of it as `robots.txt` but for helping AI agents find useful content, not blocking crawlers.

## Why it matters

Without llms.txt, an AI agent has to guess which pages on your site contain useful information. With llms.txt, agents get a structured directory of your content, including titles, descriptions, and direct links — all at a single well-known URL.

## Basic setup

Create a route handler at `app/llms.txt/route.ts`:

```ts title="app/llms.txt/route.ts"
import { createLlmsTxtHandler } from 'next-markdown-mirror/nextjs';

export const GET = createLlmsTxtHandler({
  siteName: 'My Site',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  description: 'Documentation for the Example platform.',
  pages: [
    { url: '/', title: 'Home', description: 'Welcome page' },
    { url: '/docs', title: 'Documentation', description: 'API docs and guides' },
    { url: '/blog', title: 'Blog', description: 'Latest updates' },
  ],
});
```

This serves a file at `https://yoursite.com/llms.txt` that AI agents can discover automatically.

## Page list vs sitemap URL

The `pages` option accepts either an array of page objects or a sitemap URL string.

### Static page list

Best for small sites where you want full control over what's listed:

```ts
pages: [
  { url: '/', title: 'Home', description: 'Welcome page' },
  { url: '/pricing', title: 'Pricing' },
  { url: '/docs/api', title: 'API Reference', section: 'docs' },
]
```

### Sitemap URL

For large sites, point to your `sitemap.xml` and pages are discovered automatically:

```ts
pages: 'https://example.com/sitemap.xml'
```

The `parseSitemap` function fetches the sitemap, extracts URLs, and builds page objects. Titles are derived from URL paths when not available in the sitemap.

## Sections

Organize pages into logical groups using `sections`:

```ts
export const GET = createLlmsTxtHandler({
  siteName: 'My Docs',
  baseUrl: 'https://docs.example.com',
  sections: {
    guides: { title: 'Guides', description: 'Step-by-step tutorials' },
    reference: { title: 'API Reference' },
  },
  pages: [
    { url: '/', title: 'Home' },
    { url: '/quickstart', title: 'Quick Start', section: 'guides' },
    { url: '/auth', title: 'Authentication', section: 'guides' },
    { url: '/endpoints', title: 'Endpoints', section: 'reference' },
  ],
});
```

Pages without a `section` appear at the top level. Sectioned pages are grouped under their section heading.

## Output format

The generated llms.txt looks like this:

```markdown
# My Docs

> Technical documentation for the Example API.

## Guides

> Step-by-step tutorials

- [Quick Start](https://docs.example.com/quickstart)
- [Authentication](https://docs.example.com/auth)

## API Reference

- [Endpoints](https://docs.example.com/endpoints)
```

## llms-full.txt variant

The llms-full.txt file includes expanded content for each page rather than just links. Set it up with a separate route:

```ts title="app/llms-full.txt/route.ts"
import { createLlmsFullTxtHandler } from 'next-markdown-mirror/nextjs';

export const GET = createLlmsFullTxtHandler({
  siteName: 'My Site',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  pages: [
    { url: '/', title: 'Home' },
    { url: '/about', title: 'About' },
  ],
});
```

This serves a larger file at `/llms-full.txt` that AI agents can use when they want the full content of all pages in a single request.

## Standalone usage

You can also generate llms.txt content outside of Next.js:

```ts
import { generateLlmsTxt, generateLlmsFullTxt } from 'next-markdown-mirror';

const txt = await generateLlmsTxt({
  siteName: 'My Site',
  baseUrl: 'https://example.com',
  pages: [{ url: '/', title: 'Home' }],
});

// Write to a file, serve from Express, etc.
```

See [Standalone Usage](./advanced/standalone-usage.md) for more examples.
