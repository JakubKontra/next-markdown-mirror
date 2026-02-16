import { describe, it, expect } from 'vitest';
import { isMarkdownRequest } from '../../src/utils/detect-markdown-request.js';

function makeRequest(
  accept: string,
  url = 'https://example.com/page',
): {
  headers: { get(name: string): string | null };
  url: string;
} {
  return {
    headers: {
      get(name: string) {
        if (name === 'accept') return accept;
        return null;
      },
    },
    url,
  };
}

describe('isMarkdownRequest', () => {
  it('detects Accept: text/markdown', () => {
    expect(isMarkdownRequest(makeRequest('text/markdown'))).toBe(true);
  });

  it('detects text/markdown in Accept with multiple types', () => {
    expect(isMarkdownRequest(makeRequest('text/markdown, text/html, */*'))).toBe(true);
  });

  it('does not match plain text/html', () => {
    expect(isMarkdownRequest(makeRequest('text/html'))).toBe(false);
  });

  it('detects ?v=md query parameter', () => {
    expect(isMarkdownRequest(makeRequest('text/html', 'https://example.com/page?v=md'))).toBe(true);
  });

  it('does not match ?v=html', () => {
    expect(isMarkdownRequest(makeRequest('text/html', 'https://example.com/page?v=html'))).toBe(
      false,
    );
  });

  it('returns false for normal requests', () => {
    expect(isMarkdownRequest(makeRequest('*/*'))).toBe(false);
  });
});
