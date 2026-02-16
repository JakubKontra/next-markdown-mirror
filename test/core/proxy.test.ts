import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { withMarkdownMirror } from '../../src/nextjs/proxy.js';

function makeRequest(url: string, accept = 'text/html', method = 'GET'): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { Accept: accept },
  });
}

describe('withMarkdownMirror', () => {
  const proxy = withMarkdownMirror();

  it('rewrites markdown requests to /_md path', () => {
    const req = makeRequest('https://example.com/about', 'text/markdown');
    const res = proxy(req);

    expect(res).toBeDefined();
    const rewrite = res!.headers.get('x-middleware-rewrite');
    expect(rewrite).toBe('https://example.com/md-mirror/about');
  });

  it('rewrites root path to /md-mirror/index', () => {
    const req = makeRequest('https://example.com/', 'text/markdown');
    const res = proxy(req);

    const rewrite = res!.headers.get('x-middleware-rewrite');
    expect(rewrite).toBe('https://example.com/md-mirror/index');
  });

  it('passes through ?v=md requests', () => {
    const req = makeRequest('https://example.com/about?v=md');
    const res = proxy(req);

    expect(res).toBeDefined();
    const rewrite = res!.headers.get('x-middleware-rewrite');
    // Should not include v=md in rewrite URL
    expect(rewrite).toBe('https://example.com/md-mirror/about');
  });

  it('ignores normal HTML requests', () => {
    const req = makeRequest('https://example.com/about', 'text/html');
    const res = proxy(req);

    expect(res).toBeUndefined();
  });

  it('ignores POST requests', () => {
    const req = makeRequest('https://example.com/about', 'text/markdown', 'POST');
    const res = proxy(req);

    expect(res).toBeUndefined();
  });

  it('skips API routes', () => {
    const req = makeRequest('https://example.com/api/data', 'text/markdown');
    const res = proxy(req);

    expect(res).toBeUndefined();
  });

  it('skips _next static files', () => {
    const req = makeRequest('https://example.com/_next/static/chunk.js', 'text/markdown');
    const res = proxy(req);

    expect(res).toBeUndefined();
  });

  it('skips static file extensions', () => {
    const req = makeRequest('https://example.com/image.png', 'text/markdown');
    const res = proxy(req);

    expect(res).toBeUndefined();
  });

  it('respects custom exclude paths', () => {
    const customProxy = withMarkdownMirror({
      excludePaths: ['/admin/'],
    });

    const req = makeRequest('https://example.com/admin/dashboard', 'text/markdown');
    const res = customProxy(req);

    expect(res).toBeUndefined();
  });

  it('respects custom route prefix', () => {
    const customProxy = withMarkdownMirror({
      routePrefix: '/_markdown',
    });

    const req = makeRequest('https://example.com/about', 'text/markdown');
    const res = customProxy(req);

    const rewrite = res!.headers.get('x-middleware-rewrite');
    expect(rewrite).toBe('https://example.com/_markdown/about');
  });

  it('preserves non-v query params', () => {
    const req = makeRequest('https://example.com/search?q=test&v=md&lang=en');
    const res = proxy(req);

    const rewrite = res!.headers.get('x-middleware-rewrite');
    expect(rewrite).toContain('q=test');
    expect(rewrite).toContain('lang=en');
    expect(rewrite).not.toContain('v=md');
  });
});
