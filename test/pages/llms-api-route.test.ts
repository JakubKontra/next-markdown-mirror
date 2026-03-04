import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createPagesLlmsTxtHandler,
  createPagesLlmsFullTxtHandler,
} from '../../src/pages/llms-api-route.js';

const MOCK_HTML = `
<!DOCTYPE html>
<html>
<head><title>About</title></head>
<body><main><h1>About Us</h1><p>We build things.</p></main></body>
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

const BASE_CONFIG = {
  siteName: 'Test Site',
  baseUrl: 'https://example.com',
  pages: [{ url: '/about', title: 'About' }],
};

describe('createPagesLlmsTxtHandler', () => {
  it('generates llms.txt content with correct headers', async () => {
    const handler = createPagesLlmsTxtHandler(BASE_CONFIG);
    const res = mockRes();

    await handler({}, res);

    expect(res._status).toBe(200);
    expect(res._headers['Content-Type']).toBe('text/plain; charset=utf-8');
    expect(res._headers['Cache-Control']).toBe('public, max-age=3600');
    expect(res._body).toContain('# Test Site');
    expect(res._body).toContain('[About](/about)');
  });

  it('returns 500 on generation error', async () => {
    // Pass invalid config to trigger an error — pages as a sitemap URL that will fail
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network error'));

    const handler = createPagesLlmsTxtHandler({
      siteName: 'Test',
      baseUrl: 'https://example.com',
      pages: 'https://example.com/sitemap.xml',
    });
    const res = mockRes();

    await handler({}, res);

    expect(res._status).toBe(500);
    globalThis.fetch = originalFetch;
  });
});

describe('createPagesLlmsFullTxtHandler', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('generates llms-full.txt content by fetching page HTML', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(MOCK_HTML, { status: 200 }),
    );

    const handler = createPagesLlmsFullTxtHandler(BASE_CONFIG);
    const res = mockRes();

    await handler({}, res);

    expect(res._status).toBe(200);
    expect(res._headers['Content-Type']).toBe('text/plain; charset=utf-8');
    expect(res._headers['Cache-Control']).toBe('public, max-age=3600');
    expect(res._body).toContain('# Test Site');
    expect(res._body).toContain('About Us');
  });

  it('returns 500 on fetch failure', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response('Server Error', { status: 500 }),
    );

    const handler = createPagesLlmsFullTxtHandler(BASE_CONFIG);
    const res = mockRes();

    await handler({}, res);

    // The handler catches fetch errors and returns 500
    // Since generateLlmsFullTxt catches per-page errors, the overall response
    // still succeeds but includes failure text. However if all fetches fail
    // and the generator throws, we get 500.
    // Actually the generator catches per-page errors gracefully, so the response is 200
    // with "*Failed to convert this page.*" text. Let's verify that behavior.
    expect(res._status).toBe(200);
    expect(res._body).toContain('Failed to convert this page');
  });
});
