---
sidebar_position: 1
title: Getting Started
description: Install next-markdown-mirror and set up AI-readable Markdown in 3 minutes.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Getting Started

Add AI-readable Markdown to your Next.js site in 3 minutes. When an AI agent requests any page with `Accept: text/markdown` or `?v=md`, it gets clean Markdown with structured frontmatter instead of raw HTML.

## Prerequisites

- **Node.js** 20 or later
- **Next.js** 16 or later (App Router)

## Install

<Tabs>
  <TabItem value="npm" label="npm" default>

```bash
npm install next-markdown-mirror
```

  </TabItem>
  <TabItem value="yarn" label="yarn">

```bash
yarn add next-markdown-mirror
```

  </TabItem>
  <TabItem value="pnpm" label="pnpm">

```bash
pnpm add next-markdown-mirror
```

  </TabItem>
</Tabs>

## Setup

You need 3 files to wire everything up: a proxy, a route handler, and an llms.txt endpoint.

### 1. Proxy — `proxy.ts`

Create `proxy.ts` in your project root (next to `next.config.ts`). This intercepts incoming requests from AI agents and rewrites them to the route handler.

```ts title="proxy.ts"
import { withMarkdownMirror } from 'next-markdown-mirror/nextjs';

export const proxy = withMarkdownMirror();
```

### 2. Route handler — `app/md-mirror/[...path]/route.ts`

This handler receives the rewritten request, fetches your page's HTML internally, converts it to Markdown, and returns it.

```ts title="app/md-mirror/[...path]/route.ts"
import { createMarkdownHandler } from 'next-markdown-mirror/nextjs';

export const GET = createMarkdownHandler({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
});
```

### 3. llms.txt — `app/llms.txt/route.ts`

Serve an [llms.txt](https://llmstxt.org/) file so AI agents can discover your site's content.

```ts title="app/llms.txt/route.ts"
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

## Verify

Start your dev server, then test with curl:

```bash
# Request Markdown via Accept header
curl -H "Accept: text/markdown" http://localhost:3000/

# Request Markdown via query parameter
curl "http://localhost:3000/?v=md"

# Check llms.txt
curl http://localhost:3000/llms.txt
```

You should see clean Markdown with YAML frontmatter and a `x-markdown-tokens` response header.

## Next steps

- [How It Works](./how-it-works.md) — understand the request flow and detection logic
- [Configuration](./configuration.md) — customize content selectors, excluded paths, and more
- [llms.txt Protocol](./llms-txt.md) — set up AI discovery with sitemap support
- [API Reference](./api-reference.md) — full reference for every export
