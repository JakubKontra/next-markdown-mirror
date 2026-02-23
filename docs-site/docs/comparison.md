---
sidebar_position: 6
title: Comparison
description: How next-markdown-mirror compares to Cloudflare and other approaches.
---

# Comparison

There are several ways to serve AI-readable content. Here's how next-markdown-mirror stacks up.

## next-markdown-mirror vs Cloudflare Markdown Conversion

Cloudflare offers automatic Markdown conversion as part of their Pro plan and above. Here's how the two compare:

| Feature | next-markdown-mirror | Cloudflare |
|---------|---------------------|------------|
| **Pricing** | Free (MIT license) | $20/month ($240/year) per domain |
| **Hosting** | Self-hosted, any provider | Cloudflare only |
| **Content control** | Full — selectors, filters, custom rules | Limited configuration |
| **JSON-LD extraction** | Yes | No |
| **Token counting** | Yes, with custom counter support | No |
| **llms.txt** | Built-in generation | Not included |
| **Custom Turndown rules** | Yes | No |
| **Content-Signal header** | Yes | No |
| **Setup** | 3 files, ~15 lines of code | Toggle in dashboard |
| **Framework** | Next.js 16+ (core works anywhere) | Framework-agnostic (edge) |
| **Open source** | Yes | No |

### Pricing breakdown

| | next-markdown-mirror | Cloudflare Pro |
|-|---------------------|----------------|
| 1 domain | **$0** | $240/year |
| 5 domains | **$0** | $1,200/year |
| 10 domains | **$0** | $2,400/year |

### When Cloudflare makes sense

- You're already on Cloudflare Pro or higher
- You need edge-level conversion before your origin server
- You want zero-code setup with a dashboard toggle
- You don't need JSON-LD extraction, llms.txt, or fine-grained content control

### When next-markdown-mirror makes sense

- You want full control over content extraction and filtering
- You need JSON-LD structured data in the Markdown output
- You want llms.txt support built in
- You deploy to Vercel, AWS, or any non-Cloudflare host
- You want custom Turndown rules for your specific HTML patterns
- You want it free and open source

## vs Manual approaches

You could write your own HTML-to-Markdown converter:

| | next-markdown-mirror | DIY |
|-|---------------------|-----|
| Time to set up | 3 minutes | Hours to days |
| Content filtering | Built-in defaults + customizable | Write from scratch |
| GFM support | Included (tables, strikethrough, etc.) | Configure yourself |
| Special elements | dl, details, mark, abbr, figure, etc. | Handle each one |
| Maintenance | npm updates | You maintain everything |
| llms.txt | Built-in | Build your own |

A DIY approach makes sense if you have very unusual requirements that the library can't handle, or if you need to support a non-Node.js backend without using the standalone API.

## vs No AI optimization

What happens if you serve raw HTML to AI agents?

- **Lost context** — AI agents parse your nav, footer, cookie banners, and ads as "content"
- **Token waste** — HTML boilerplate can 2-5x the token count vs clean Markdown
- **Missing structure** — no frontmatter, no token counts, no content signals
- **No discovery** — without llms.txt, agents can't find your content efficiently
- **Poor answers** — AI tools citing your content may produce lower-quality responses

Adding next-markdown-mirror takes 3 minutes and gives AI agents a clean, structured view of your content — improving how your site appears in AI-powered search, chatbots, and coding assistants.
