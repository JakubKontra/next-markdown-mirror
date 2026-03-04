import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPagesMarkdownHandler } from '../../src/pages/api-route-handler.js';

const MOCK_HTML = `
<!DOCTYPE html>
<html>
<head><title>Test Page</title></head>
<body><main><h1>Hello World</h1><p>Some content.</p></main></body>
</html>
`;

function mockRes() {
  const res = {
    status: vi.fn(),
    setHeader: vi.fn(),
    end: vi.fn(),
    _status: 0,
    _body: '',
    _headers: {} as Record<string, string>,
  };
  res.status.mockImplementation((code: number) => {
    res._status = code;
    return res;
  });
  res.setHeader.mockImplementation((k: string, v: string) => {
    res._headers[k] = v;
  });
  res.end.mockImplementation((body?: string) => {
    res._body = body ?? '';
  });
  return res;
}

describe('createPagesMarkdownHandler', () => {
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

    const handler = createPagesMarkdownHandler({ baseUrl: 'http://localhost:3000' });
    const req = { method: 'GET', query: { path: ['about'] }, headers: {} };
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(200);
    expect(res._headers['Content-Type']).toBe('text/markdown; charset=utf-8');
    expect(res._headers['Vary']).toBe('Accept');
    expect(res._headers['x-markdown-tokens']).toBeDefined();
    expect(res._body).toContain('Hello World');
  });

  it('returns 405 for non-GET methods', async () => {
    const handler = createPagesMarkdownHandler({ baseUrl: 'http://localhost:3000' });
    const req = { method: 'POST', query: {}, headers: {} };
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(405);
    expect(res._body).toBe('Method Not Allowed');
  });

  it('returns upstream status on fetch error (404)', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response('Not Found', { status: 404 }));

    const handler = createPagesMarkdownHandler({ baseUrl: 'http://localhost:3000' });
    const req = { method: 'GET', query: { path: ['missing'] }, headers: {} };
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(404);
    expect(res._body).toContain('404');
  });

  it('strips path and v query params, preserves others in internal fetch URL', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(MOCK_HTML, { status: 200 }));

    const handler = createPagesMarkdownHandler({ baseUrl: 'http://localhost:3000' });
    const req = { method: 'GET', query: { path: ['page'], v: 'md', lang: 'en' }, headers: {} };
    const res = mockRes();

    await handler(req, res);

    const calledUrl = vi.mocked(globalThis.fetch).mock.calls[0][0] as string;
    expect(calledUrl).toContain('lang=en');
    expect(calledUrl).not.toContain('v=md');
    expect(calledUrl).not.toContain('path=');
  });

  it('maps /index path back to /', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(MOCK_HTML, { status: 200 }));

    const handler = createPagesMarkdownHandler({ baseUrl: 'http://localhost:3000' });
    const req = { method: 'GET', query: { path: ['index'] }, headers: {} };
    const res = mockRes();

    await handler(req, res);

    const calledUrl = vi.mocked(globalThis.fetch).mock.calls[0][0] as string;
    expect(calledUrl).toBe('http://localhost:3000/');
  });

  it('forwards cookies from req.headers.cookie', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(MOCK_HTML, { status: 200 }));

    const handler = createPagesMarkdownHandler({ baseUrl: 'http://localhost:3000' });
    const req = { method: 'GET', query: { path: ['dashboard'] }, headers: { cookie: 'session=abc123' } };
    const res = mockRes();

    await handler(req, res);

    const calledHeaders = vi.mocked(globalThis.fetch).mock.calls[0][1] as RequestInit;
    expect((calledHeaders.headers as Record<string, string>)['Cookie']).toBe('session=abc123');
  });

  it('returns 500 on conversion error', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(MOCK_HTML, { status: 200 }));

    const handler = createPagesMarkdownHandler({
      baseUrl: 'http://localhost:3000',
      maxContentSize: 1,
    });
    const req = { method: 'GET', query: { path: ['page'] }, headers: {} };
    const res = mockRes();

    await handler(req, res);

    expect(res._status).toBe(500);
  });
});
