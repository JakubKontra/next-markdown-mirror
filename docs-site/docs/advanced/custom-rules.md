---
sidebar_position: 1
title: Custom Turndown Rules
description: Add custom HTML-to-Markdown conversion rules.
---

# Custom Turndown Rules

next-markdown-mirror uses [Turndown](https://github.com/mixmark-io/turndown) to convert HTML to Markdown. You can add custom rules to handle your specific HTML patterns.

## How Turndown rules work

A Turndown rule has two parts:

- **filter** — determines which HTML elements the rule applies to (tag name, class, attribute, or a function)
- **replacement** — a function that returns the Markdown string for matched elements

Rules are evaluated in order. The first matching rule wins.

## Adding rules via config

Pass custom rules through the `turndownRules` option in your route handler config:

```ts title="app/md-mirror/[...path]/route.ts"
import { createMarkdownHandler } from 'next-markdown-mirror/nextjs';

export const GET = createMarkdownHandler({
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  turndownRules: {
    callout: {
      filter: (node) => {
        return (
          node.nodeName === 'DIV' &&
          node.classList.contains('callout')
        );
      },
      replacement: (content, node) => {
        const type = node.getAttribute('data-type') || 'note';
        return `> **${type.charAt(0).toUpperCase() + type.slice(1)}:** ${content.trim()}\n\n`;
      },
    },
  },
});
```

This converts `<div class="callout" data-type="warning">Be careful</div>` into:

```markdown
> **Warning:** Be careful
```

## Rule structure

Each rule is an object with `filter` and `replacement`:

```ts
{
  filter: string | string[] | ((node: HTMLElement, options: Options) => boolean),
  replacement: (content: string, node: HTMLElement, options: Options) => string,
}
```

### Filter types

**String** — match by tag name:

```ts
filter: 'aside'
```

**String array** — match multiple tag names:

```ts
filter: ['aside', 'section']
```

**Function** — match by any condition:

```ts
filter: (node) => node.classList.contains('highlight')
```

### Replacement function

The replacement function receives:

- `content` — the already-converted inner content of the element
- `node` — the original HTML element
- `options` — Turndown options

It must return a string (the Markdown output).

## Example: custom component

Convert a custom alert component to a Markdown blockquote:

```ts
turndownRules: {
  alert: {
    filter: (node) => node.getAttribute('role') === 'alert',
    replacement: (content) => {
      return `> ${content.trim()}\n\n`;
    },
  },
}
```

## Example: preserving HTML elements

Sometimes you want to keep certain elements as raw HTML in the Markdown output:

```ts
turndownRules: {
  preserveVideo: {
    filter: 'video',
    replacement: (_content, node) => {
      return `\n\n${node.outerHTML}\n\n`;
    },
  },
}
```

## Example: custom code blocks

Convert syntax-highlighted `<pre>` blocks with a language class:

```ts
turndownRules: {
  codeBlock: {
    filter: (node) => {
      return (
        node.nodeName === 'PRE' &&
        node.firstChild?.nodeName === 'CODE'
      );
    },
    replacement: (_content, node) => {
      const code = node.querySelector('code');
      const lang = code?.className.match(/language-(\w+)/)?.[1] || '';
      const text = code?.textContent || '';
      return `\n\n\`\`\`${lang}\n${text}\n\`\`\`\n\n`;
    },
  },
}
```

## Using registerCustomRules directly

If you're using the `HtmlToMarkdown` class directly (see [Standalone Usage](./standalone-usage.md)), you can register rules on any TurndownService instance:

```ts
import TurndownService from 'turndown';
import { registerCustomRules } from 'next-markdown-mirror';

const service = new TurndownService();

registerCustomRules(service, {
  callout: {
    filter: (node) => node.classList.contains('callout'),
    replacement: (content) => `> ${content.trim()}\n\n`,
  },
});
```

This is useful when you need full control over the Turndown instance rather than using the config-based approach.
