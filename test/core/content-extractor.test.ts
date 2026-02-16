import { describe, it, expect } from 'vitest';
import { parseHTML } from 'linkedom';
import { extractContent } from '../../src/core/content-extractor.js';

function doc(html: string) {
  return parseHTML(html).document;
}

describe('extractContent', () => {
  it('finds <main> element', () => {
    const d = doc('<html><body><main><p>Content</p></main></body></html>');
    const el = extractContent(d) as Element;
    expect(el.tagName).toBe('MAIN');
  });

  it('finds <article> element when no <main>', () => {
    const d = doc('<html><body><article><p>Content</p></article></body></html>');
    const el = extractContent(d) as Element;
    expect(el.tagName).toBe('ARTICLE');
  });

  it('finds [role="main"] element', () => {
    const d = doc('<html><body><div role="main"><p>Content</p></div></body></html>');
    const el = extractContent(d) as Element;
    expect(el.getAttribute('role')).toBe('main');
  });

  it('finds #content element', () => {
    const d = doc('<html><body><div id="content"><p>Content</p></div></body></html>');
    const el = extractContent(d) as Element;
    expect(el.id).toBe('content');
  });

  it('falls back to body', () => {
    const d = doc('<html><body><p>Content</p></body></html>');
    const el = extractContent(d) as Element;
    expect(el.tagName).toBe('BODY');
  });

  it('uses custom selectors in priority order', () => {
    const d = doc(
      '<html><body><main><p>Main</p></main><div class="custom"><p>Custom</p></div></body></html>',
    );
    const el = extractContent(d, ['.custom']) as Element;
    expect(el.className).toBe('custom');
  });
});
