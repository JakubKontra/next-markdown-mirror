import { describe, it, expect } from 'vitest';
import { buildMarkdownHeaders } from '../../src/nextjs/headers.js';

describe('buildMarkdownHeaders', () => {
  it('builds basic markdown headers', () => {
    const headers = buildMarkdownHeaders({ tokenCount: 500 });

    expect(headers['Content-Type']).toBe('text/markdown; charset=utf-8');
    expect(headers['Vary']).toBe('Accept');
    expect(headers['x-markdown-tokens']).toBe('500');
  });

  it('includes Content-Signal when provided', () => {
    const headers = buildMarkdownHeaders({
      tokenCount: 100,
      contentSignal: 'ai-input',
    });

    expect(headers['Content-Signal']).toBe('ai-input');
  });

  it('omits Content-Signal when not provided', () => {
    const headers = buildMarkdownHeaders({ tokenCount: 100 });

    expect(headers['Content-Signal']).toBeUndefined();
  });
});
