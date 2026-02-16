import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { HtmlToMarkdown } from '../../src/core/converter.js';

const fixturesDir = join(import.meta.dirname, '..', 'fixtures');

function readFixture(name: string): string {
  return readFileSync(join(fixturesDir, name), 'utf-8');
}

describe('HtmlToMarkdown', () => {
  it('converts a simple HTML page to markdown', () => {
    const html = readFixture('simple-page.html');
    const converter = new HtmlToMarkdown({ baseUrl: 'https://example.com' });
    const result = converter.convert(html);

    expect(result.markdown).toContain('# Hello World');
    expect(result.markdown).toContain('**test**');
    expect(result.markdown).toContain('[a link](https://example.com/link)');
    expect(result.markdown).toContain('## Section Two');
    expect(result.markdown).toContain('*emphasis*');
    expect(result.markdown).toContain('Item one');
    expect(result.markdown).toContain('const x = 42;');
    expect(result.tokenCount).toBeGreaterThan(0);
    expect(result.title).toBe('Test Page');
  });

  it('extracts JSON-LD as YAML frontmatter', () => {
    const html = readFixture('simple-page.html');
    const converter = new HtmlToMarkdown();
    const result = converter.convert(html);

    expect(result.markdown).toContain('---');
    expect(result.markdown).toContain('type: Article');
    expect(result.markdown).toContain('title: Test Article');
    expect(result.markdown).toContain('author: John Doe');
    expect(result.jsonLd).toBeDefined();
    expect(result.jsonLd).toHaveLength(1);
  });

  it('can disable JSON-LD extraction', () => {
    const html = readFixture('simple-page.html');
    const converter = new HtmlToMarkdown({ extractJsonLd: false });
    const result = converter.convert(html);

    expect(result.markdown).not.toContain('---');
    expect(result.jsonLd).toBeUndefined();
  });

  it('filters out nav, footer, forms, data-md-skip, aria-hidden', () => {
    const html = readFixture('complex-page.html');
    const converter = new HtmlToMarkdown();
    const result = converter.convert(html);

    // Should not contain nav content
    expect(result.markdown).not.toContain('Main navigation');
    // Should not contain footer
    expect(result.markdown).not.toContain('Footer content');
    // Should not contain form elements
    expect(result.markdown).not.toContain('Submit');
    // Should not contain data-md-skip
    expect(result.markdown).not.toContain('This should be skipped');
    // Should not contain aria-hidden
    expect(result.markdown).not.toContain('Hidden from accessibility tree');
  });

  it('filters out small images (icons)', () => {
    const html = readFixture('simple-page.html');
    const converter = new HtmlToMarkdown({ baseUrl: 'https://example.com' });
    const result = converter.convert(html);

    // Full-size image should be present
    expect(result.markdown).toContain('photo.jpg');
    // Small icon should be filtered
    expect(result.markdown).not.toContain('small.png');
  });

  it('handles custom Turndown elements (dl, details, mark, abbr, figure, q, sub, sup)', () => {
    const html = readFixture('complex-page.html');
    const converter = new HtmlToMarkdown();
    const result = converter.convert(html);

    // Definition list
    expect(result.markdown).toContain('**Term 1**');
    expect(result.markdown).toContain(': Definition 1');

    // Details/summary
    expect(result.markdown).toContain('<details>');
    expect(result.markdown).toContain('<summary>Click to expand</summary>');

    // Mark
    expect(result.markdown).toContain('==highlighted==');

    // Abbr
    expect(result.markdown).toContain('HTML (HyperText Markup Language)');

    // Figure
    expect(result.markdown).toContain('![Sales chart]');
    expect(result.markdown).toContain('*Figure 1: Sales over time*');

    // Inline quote
    expect(result.markdown).toContain('"hello world"');

    // Sub/sup
    expect(result.markdown).toContain('~2~');
    expect(result.markdown).toContain('^2^');
  });

  it('handles @graph JSON-LD', () => {
    const html = readFixture('complex-page.html');
    const converter = new HtmlToMarkdown();
    const result = converter.convert(html);

    expect(result.jsonLd).toHaveLength(2);
  });

  it('resolves relative URLs with baseUrl', () => {
    const html = readFixture('simple-page.html');
    const converter = new HtmlToMarkdown({
      baseUrl: 'https://example.com',
    });
    const result = converter.convert(html);

    expect(result.markdown).toContain('https://example.com/link');
    expect(result.markdown).toContain('https://example.com/images/photo.jpg');
  });

  it('handles GFM tables', () => {
    const html = readFixture('complex-page.html');
    const converter = new HtmlToMarkdown();
    const result = converter.convert(html);

    expect(result.markdown).toContain('| Name | Value |');
    expect(result.markdown).toContain('Alpha');
    expect(result.markdown).toContain('Beta');
  });

  it('throws on content exceeding maxContentSize', () => {
    const converter = new HtmlToMarkdown({ maxContentSize: 10 });
    expect(() => converter.convert('<html><body>Long content</body></html>')).toThrow(
      'Content size',
    );
  });

  it('handles empty HTML gracefully', () => {
    const converter = new HtmlToMarkdown();
    const result = converter.convert('<html><body></body></html>');
    expect(result.markdown).toBeDefined();
    expect(result.tokenCount).toBeGreaterThanOrEqual(0);
  });

  it('accepts custom token counter', () => {
    const html = readFixture('simple-page.html');
    const converter = new HtmlToMarkdown({
      tokenCounter: () => 999,
    });
    const result = converter.convert(html);
    expect(result.tokenCount).toBe(999);
  });
});
