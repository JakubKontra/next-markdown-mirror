---
sidebar_position: 3
title: Standalone Usage
description: Use next-markdown-mirror without Next.js — in Express, Node scripts, or any framework.
---

# Standalone Usage

The core API of next-markdown-mirror works without Next.js. You can use it in Express, plain Node.js scripts, or any JavaScript/TypeScript environment.

## The core works anywhere

The Next.js-specific code (`proxy`, `createMarkdownHandler`, etc.) lives in the `next-markdown-mirror/nextjs` entry point. Everything else — `HtmlToMarkdown`, `extractContent`, `filterContent`, `generateLlmsTxt`, and more — is in the base `next-markdown-mirror` entry point and has no Next.js dependency.

## Express.js middleware

Serve Markdown responses from an Express app:

```ts
import express from 'express';
import { HtmlToMarkdown, isMarkdownRequest } from 'next-markdown-mirror';

const app = express();
const converter = new HtmlToMarkdown({
  contentSelectors: ['article', 'main'],
  extractJsonLd: true,
});

app.get('*', async (req, res, next) => {
  // Only intercept AI agent requests
  if (!isMarkdownRequest(req)) {
    return next();
  }

  // Fetch the HTML from your own server or a CMS
  const htmlResponse = await fetch(`http://localhost:3000${req.path}`);
  const html = await htmlResponse.text();

  const result = converter.convert(html);

  res.set({
    'Content-Type': 'text/markdown; charset=utf-8',
    'Vary': 'Accept',
    'x-markdown-tokens': String(result.tokenCount),
  });

  res.send(result.markdown);
});
```

## Node.js script

Convert a remote page to Markdown in a script:

```ts
import { HtmlToMarkdown } from 'next-markdown-mirror';

const converter = new HtmlToMarkdown({
  contentSelectors: ['article', 'main'],
  extractJsonLd: true,
});

const response = await fetch('https://example.com/blog/my-post');
const html = await response.text();

const result = converter.convert(html);

console.log('Title:', result.title);
console.log('Tokens:', result.tokenCount);
console.log('JSON-LD:', result.jsonLd);
console.log('---');
console.log(result.markdown);
```

## Using individual functions

You can use the extraction and filtering functions independently for more control:

### Extract main content

```ts
import { extractContent } from 'next-markdown-mirror';

const html = '<html><body><nav>...</nav><main><h1>Hello</h1></main></body></html>';
const mainContent = extractContent(html, ['main', 'article']);
// '<h1>Hello</h1>'
```

### Filter non-content elements

```ts
import { filterContent } from 'next-markdown-mirror';

const cleaned = filterContent(html, {
  exclude: ['.sidebar', '.ads', '.cookie-banner'],
  include: ['pre'],  // keep code blocks even if inside excluded areas
});
```

### Extract JSON-LD

```ts
import { extractJsonLd } from 'next-markdown-mirror';

const schemas = extractJsonLd(html);
// [{ "@type": "Article", "headline": "My Post", ... }]
```

### Count tokens

```ts
import { countTokens } from 'next-markdown-mirror';

const tokens = countTokens(markdownContent);
console.log(`Approximately ${tokens} tokens`);
```

### Check if a request wants Markdown

```ts
import { isMarkdownRequest } from 'next-markdown-mirror';

// Works with any standard Request object
const request = new Request('https://example.com/?v=md');
isMarkdownRequest(request); // true

const request2 = new Request('https://example.com/', {
  headers: { Accept: 'text/markdown' },
});
isMarkdownRequest(request2); // true
```

## llms.txt generation

Generate llms.txt files standalone without a route handler:

```ts
import { generateLlmsTxt, generateLlmsFullTxt } from 'next-markdown-mirror';

// Basic llms.txt
const txt = await generateLlmsTxt({
  siteName: 'My Site',
  baseUrl: 'https://example.com',
  description: 'A great website.',
  pages: [
    { url: '/', title: 'Home', description: 'Welcome page' },
    { url: '/about', title: 'About' },
    { url: '/docs', title: 'Documentation', section: 'resources' },
  ],
  sections: {
    resources: { title: 'Resources' },
  },
});

// Write to a file
import { writeFileSync } from 'fs';
writeFileSync('public/llms.txt', txt);

// Full-text variant
const fullTxt = await generateLlmsFullTxt({
  siteName: 'My Site',
  baseUrl: 'https://example.com',
  pages: [{ url: '/', title: 'Home' }],
});
writeFileSync('public/llms-full.txt', fullTxt);
```

### Using a sitemap

Pass a sitemap URL as the `pages` value to auto-discover pages:

```ts
import { generateLlmsTxt, parseSitemap } from 'next-markdown-mirror';

// Option 1: pass sitemap URL directly
const txt = await generateLlmsTxt({
  siteName: 'My Site',
  baseUrl: 'https://example.com',
  pages: 'https://example.com/sitemap.xml',
});

// Option 2: parse sitemap separately for more control
const pages = await parseSitemap(
  'https://example.com/sitemap.xml',
  'https://example.com'
);

// Filter or modify pages before generating
const docsPages = pages.filter(p => p.url.startsWith('/docs'));

const txt2 = await generateLlmsTxt({
  siteName: 'My Docs',
  baseUrl: 'https://example.com',
  pages: docsPages,
});
```
