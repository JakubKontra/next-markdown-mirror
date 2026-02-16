import { describe, it, expect } from 'vitest';
import { parseHTML } from 'linkedom';
import { extractJsonLd } from '../../src/core/jsonld-extractor.js';

function doc(html: string) {
  return parseHTML(html).document;
}

describe('extractJsonLd', () => {
  it('extracts simple JSON-LD', () => {
    const d = doc(`<html><head>
      <script type="application/ld+json">{"@type":"Article","headline":"Test"}</script>
    </head><body></body></html>`);
    const result = extractJsonLd(d);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]['@type']).toBe('Article');
    expect(result.frontmatter).toContain('title: Test');
  });

  it('handles @graph wrapper', () => {
    const d = doc(`<html><head>
      <script type="application/ld+json">{"@graph":[{"@type":"WebPage","name":"Page"},{"@type":"Organization","name":"Org"}]}</script>
    </head><body></body></html>`);
    const result = extractJsonLd(d);

    expect(result.data).toHaveLength(2);
  });

  it('handles multiple JSON-LD scripts', () => {
    const d = doc(`<html><head>
      <script type="application/ld+json">{"@type":"Article","headline":"One"}</script>
      <script type="application/ld+json">{"@type":"Product","name":"Two"}</script>
    </head><body></body></html>`);
    const result = extractJsonLd(d);

    expect(result.data).toHaveLength(2);
  });

  it('generates YAML frontmatter with common fields', () => {
    const d = doc(`<html><head>
      <script type="application/ld+json">{
        "@type":"Article",
        "headline":"My Article",
        "description":"A description",
        "datePublished":"2025-01-15",
        "author":{"@type":"Person","name":"Jane"}
      }</script>
    </head><body></body></html>`);
    const result = extractJsonLd(d);

    expect(result.frontmatter).toContain('---');
    expect(result.frontmatter).toContain('title: My Article');
    expect(result.frontmatter).toContain('description: A description');
    expect(result.frontmatter).toContain('datePublished: 2025-01-15');
    expect(result.frontmatter).toContain('author: Jane');
  });

  it('returns empty result when no JSON-LD present', () => {
    const d = doc('<html><head></head><body></body></html>');
    const result = extractJsonLd(d);

    expect(result.data).toHaveLength(0);
    expect(result.frontmatter).toBe('');
  });

  it('skips invalid JSON-LD gracefully', () => {
    const d = doc(`<html><head>
      <script type="application/ld+json">not valid json</script>
      <script type="application/ld+json">{"@type":"Article","headline":"Valid"}</script>
    </head><body></body></html>`);
    const result = extractJsonLd(d);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]['headline']).toBe('Valid');
  });

  it('simplifies image objects to URL', () => {
    const d = doc(`<html><head>
      <script type="application/ld+json">{
        "@type":"Article",
        "headline":"Test",
        "image":{"@type":"ImageObject","url":"https://example.com/img.jpg","width":800}
      }</script>
    </head><body></body></html>`);
    const result = extractJsonLd(d);

    expect(result.frontmatter).toContain('image: https://example.com/img.jpg');
  });
});
