import type { RouteHandlerConfig } from '../core/types.js';
import { HtmlToMarkdown } from '../core/converter.js';
import { buildMarkdownHeaders } from '../nextjs/headers.js';

/** Minimal request shape compatible with NextApiRequest (extends IncomingMessage). */
interface PagesApiRequest {
  method?: string;
  query: Partial<Record<string, string | string[]>>;
  headers: Record<string, string | string[] | undefined>;
}

/** Minimal response shape compatible with NextApiResponse. */
interface PagesApiResponse {
  status(code: number): PagesApiResponse;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
}

/**
 * Create a Pages Router API route handler for /api/md-mirror/[...path].ts
 *
 * Usage:
 *   // pages/api/md-mirror/[...path].ts
 *   import { createPagesMarkdownHandler } from 'next-markdown-mirror/pages';
 *   export default createPagesMarkdownHandler({
 *     baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
 *   });
 */
export function createPagesMarkdownHandler(config: RouteHandlerConfig) {
  const converter = new HtmlToMarkdown(config);

  return async function handler(req: PagesApiRequest, res: PagesApiResponse): Promise<void> {
    if (req.method !== 'GET') {
      res.status(405).end('Method Not Allowed');
      return;
    }

    // Reconstruct the original path from catch-all param
    const pathParam = req.query.path;
    const pathSegments = Array.isArray(pathParam) ? pathParam : pathParam ? [pathParam] : ['index'];
    let originalPath = '/' + pathSegments.join('/');

    // Map /index back to /
    if (originalPath === '/index') {
      originalPath = '/';
    }

    // Build the URL to fetch internally
    const fetchUrl = new URL(originalPath, config.baseUrl);

    // Pass through query params (except path and v)
    for (const [key, value] of Object.entries(req.query)) {
      if (key === 'path' || key === 'v') continue;
      if (typeof value === 'string') {
        fetchUrl.searchParams.set(key, value);
      }
    }

    try {
      // Internal fetch with Accept: text/html to prevent recursion
      const headers: Record<string, string> = {
        Accept: 'text/html',
        ...config.additionalHeaders,
      };

      // Pass through cookies for auth/session
      const cookie = req.headers.cookie;
      if (typeof cookie === 'string') {
        headers['Cookie'] = cookie;
      }

      const response = await fetch(fetchUrl.href, { headers });

      if (!response.ok) {
        res.status(response.status).end(`Upstream returned ${response.status}`);
        return;
      }

      const html = await response.text();
      const result = converter.convert(html);

      const mdHeaders = buildMarkdownHeaders({
        tokenCount: result.tokenCount,
        contentSignal: config.contentSignal,
      });

      for (const [key, value] of Object.entries(mdHeaders)) {
        res.setHeader(key, value);
      }

      res.status(200).end(result.markdown);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Conversion failed';
      res.status(500).end(message);
    }
  };
}
