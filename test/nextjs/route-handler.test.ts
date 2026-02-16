import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMarkdownHandler } from '../../src/nextjs/route-handler.js';

const MOCK_HTML = `
<!DOCTYPE html>
<html>
<head><title>Test Page</title></head>
<body><main><h1>Hello World</h1><p>Some content.</p></main></body>
</html>
`;

describe('createMarkdownHandler', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('converts HTML to markdown with correct headers', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(MOCK_HTML, { status: 200, headers: { 'Content-Type': 'text/html' } }),
    );

    const handler = createMarkdownHandler({ baseUrl: 'http://localhost:3000' });
    const request = new Request('http://localhost:3000/md-mirror/about');
    const response = await handler(request, { params: Promise.resolve({ path: ['about'] }) });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('Vary')).toBe('Accept');
    expect(response.headers.get('x-markdown-tokens')).toBeDefined();

    const body = await response.text();
    expect(body).toContain('Hello World');
  });

  it('returns upstream status on fetch error (404)', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response('Not Found', { status: 404 }));

    const handler = createMarkdownHandler({ baseUrl: 'http://localhost:3000' });
    const request = new Request('http://localhost:3000/md-mirror/missing');
    const response = await handler(request, { params: Promise.resolve({ path: ['missing'] }) });

    expect(response.status).toBe(404);
    const body = await response.text();
    expect(body).toContain('404');
  });

  it('strips ?v=md but preserves other query params', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(MOCK_HTML, { status: 200 }));

    const handler = createMarkdownHandler({ baseUrl: 'http://localhost:3000' });
    const request = new Request('http://localhost:3000/md-mirror/page?v=md&lang=en');
    await handler(request, { params: Promise.resolve({ path: ['page'] }) });

    const calledUrl = vi.mocked(globalThis.fetch).mock.calls[0][0] as string;
    expect(calledUrl).toContain('lang=en');
    expect(calledUrl).not.toContain('v=md');
  });

  it('maps /index back to /', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(MOCK_HTML, { status: 200 }));

    const handler = createMarkdownHandler({ baseUrl: 'http://localhost:3000' });
    const request = new Request('http://localhost:3000/md-mirror/index');
    await handler(request, { params: Promise.resolve({ path: ['index'] }) });

    const calledUrl = vi.mocked(globalThis.fetch).mock.calls[0][0] as string;
    expect(calledUrl).toBe('http://localhost:3000/');
  });

  it('forwards cookies', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(MOCK_HTML, { status: 200 }));

    const handler = createMarkdownHandler({ baseUrl: 'http://localhost:3000' });
    const request = new Request('http://localhost:3000/md-mirror/dashboard', {
      headers: { Cookie: 'session=abc123' },
    });
    await handler(request, { params: Promise.resolve({ path: ['dashboard'] }) });

    const calledHeaders = vi.mocked(globalThis.fetch).mock.calls[0][1] as RequestInit;
    expect((calledHeaders.headers as Record<string, string>)['Cookie']).toBe('session=abc123');
  });

  it('returns 500 on conversion error', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(MOCK_HTML, { status: 200 }));

    const handler = createMarkdownHandler({
      baseUrl: 'http://localhost:3000',
      maxContentSize: 1, // Force conversion to fail
    });
    const request = new Request('http://localhost:3000/md-mirror/page');
    const response = await handler(request, { params: Promise.resolve({ path: ['page'] }) });

    expect(response.status).toBe(500);
  });
});
