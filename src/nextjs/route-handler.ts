import type { RouteHandlerConfig } from '../core/types.js';
import { HtmlToMarkdown } from '../core/converter.js';
import { buildMarkdownHeaders } from './headers.js';

/**
 * Create a Next.js route handler for /md-mirror/[...path]/route.ts
 *
 * Usage:
 *   // app/md-mirror/[...path]/route.ts
 *   import { createMarkdownHandler } from 'next-markdown-mirror/nextjs';
 *   export const GET = createMarkdownHandler({
 *     baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
 *   });
 */
export function createMarkdownHandler(config: RouteHandlerConfig) {
  const converter = new HtmlToMarkdown(config);

  return async function GET(
    request: Request,
    context: { params: Promise<{ path?: string[] }> },
  ): Promise<Response> {
    const params = await context.params;
    // Reconstruct the original path
    const pathSegments = params.path ?? ['index'];
    let originalPath = '/' + pathSegments.join('/');

    // Map /index back to /
    if (originalPath === '/index') {
      originalPath = '/';
    }

    // Build the URL to fetch internally
    const fetchUrl = new URL(originalPath, config.baseUrl);

    // Pass through query params (except v=md which is a markdown-mirror param)
    const requestUrl = new URL(request.url);
    for (const [key, value] of requestUrl.searchParams) {
      if (key !== 'v') {
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
      const cookie = request.headers.get('cookie');
      if (cookie) {
        headers['Cookie'] = cookie;
      }

      const response = await fetch(fetchUrl.href, { headers });

      if (!response.ok) {
        return new Response(`Upstream returned ${response.status}`, {
          status: response.status,
        });
      }

      const html = await response.text();
      const result = converter.convert(html);

      return new Response(result.markdown, {
        status: 200,
        headers: buildMarkdownHeaders({
          tokenCount: result.tokenCount,
          contentSignal: config.contentSignal,
        }),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Conversion failed';
      return new Response(message, { status: 500 });
    }
  };
}
