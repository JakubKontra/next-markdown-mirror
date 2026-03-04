import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { createMarkdownMiddleware } from '../../src/pages/middleware.js';

function makeRequest(url: string, accept = 'text/html', method = 'GET'): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { Accept: accept },
  });
}

describe('createMarkdownMiddleware', () => {
  const middleware = createMarkdownMiddleware();

  it('rewrites markdown Accept header requests to /api/md-mirror/...', () => {
    const req = makeRequest('https://example.com/about', 'text/markdown');
    const res = middleware(req);

    expect(res).toBeDefined();
    const rewrite = res!.headers.get('x-middleware-rewrite');
    expect(rewrite).toBe('https://example.com/api/md-mirror/about');
  });

  it('rewrites root / to /api/md-mirror/index', () => {
    const req = makeRequest('https://example.com/', 'text/markdown');
    const res = middleware(req);

    const rewrite = res!.headers.get('x-middleware-rewrite');
    expect(rewrite).toBe('https://example.com/api/md-mirror/index');
  });

  it('rewrites ?v=md requests, stripping v param from rewrite URL', () => {
    const req = makeRequest('https://example.com/about?v=md');
    const res = middleware(req);

    expect(res).toBeDefined();
    const rewrite = res!.headers.get('x-middleware-rewrite');
    expect(rewrite).toBe('https://example.com/api/md-mirror/about');
  });

  it('returns NextResponse.next() for normal HTML requests', () => {
    const req = makeRequest('https://example.com/about', 'text/html');
    const res = middleware(req);

    expect(res).toBeDefined();
    expect(res!.headers.get('x-middleware-rewrite')).toBeNull();
    expect(res!.headers.get('x-middleware-next')).toBe('1');
  });

  it('returns NextResponse.next() for POST requests', () => {
    const req = makeRequest('https://example.com/about', 'text/markdown', 'POST');
    const res = middleware(req);

    expect(res).toBeDefined();
    expect(res!.headers.get('x-middleware-next')).toBe('1');
  });

  it('returns NextResponse.next() for /api/ routes', () => {
    const req = makeRequest('https://example.com/api/data', 'text/markdown');
    const res = middleware(req);

    expect(res).toBeDefined();
    expect(res!.headers.get('x-middleware-next')).toBe('1');
  });

  it('returns NextResponse.next() for /_next/ paths', () => {
    const req = makeRequest('https://example.com/_next/static/chunk.js', 'text/markdown');
    const res = middleware(req);

    expect(res).toBeDefined();
    expect(res!.headers.get('x-middleware-next')).toBe('1');
  });

  it('returns NextResponse.next() for static file extensions', () => {
    const req = makeRequest('https://example.com/image.png', 'text/markdown');
    const res = middleware(req);

    expect(res).toBeDefined();
    expect(res!.headers.get('x-middleware-next')).toBe('1');
  });

  it('respects custom excludePaths', () => {
    const customMiddleware = createMarkdownMiddleware({
      excludePaths: ['/admin/'],
    });

    const req = makeRequest('https://example.com/admin/dashboard', 'text/markdown');
    const res = customMiddleware(req);

    expect(res).toBeDefined();
    expect(res!.headers.get('x-middleware-next')).toBe('1');
  });

  it('respects custom routePrefix', () => {
    const customMiddleware = createMarkdownMiddleware({
      routePrefix: '/api/markdown',
    });

    const req = makeRequest('https://example.com/about', 'text/markdown');
    const res = customMiddleware(req);

    const rewrite = res!.headers.get('x-middleware-rewrite');
    expect(rewrite).toBe('https://example.com/api/markdown/about');
  });

  it('preserves non-v query params in rewrite URL', () => {
    const req = makeRequest('https://example.com/search?q=test&v=md&lang=en');
    const res = middleware(req);

    const rewrite = res!.headers.get('x-middleware-rewrite');
    expect(rewrite).toContain('q=test');
    expect(rewrite).toContain('lang=en');
    expect(rewrite).not.toContain('v=md');
  });
});
