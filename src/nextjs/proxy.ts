import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { ProxyConfig } from '../core/types.js';
import { isMarkdownRequest } from '../utils/detect-markdown-request.js';

// Default paths to exclude from markdown rewriting
const DEFAULT_EXCLUDE = [
  '/api/',
  '/_next/',
  '/md-mirror/',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/llms-full.txt',
];

// Static file extensions to skip
const STATIC_EXT =
  /\.(css|js|json|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|map|webp|avif|mp4|webm|pdf)$/i;

/**
 * Higher-order function that wraps a Next.js 16 proxy function
 * to detect markdown requests and rewrite them to /md-mirror/...
 *
 * Usage:
 *   // proxy.ts
 *   import { withMarkdownMirror } from 'markdown-mirror/nextjs';
 *   export const proxy = withMarkdownMirror();
 */
export function withMarkdownMirror(config: ProxyConfig = {}) {
  const excludePaths = [...DEFAULT_EXCLUDE, ...(config.excludePaths ?? [])];
  const prefix = config.routePrefix ?? '/md-mirror';

  return function proxy(request: NextRequest) {
    // Only process GET requests
    if (request.method !== 'GET') return;

    const pathname = request.nextUrl.pathname;

    // Skip static files
    if (STATIC_EXT.test(pathname)) return;

    // Skip excluded paths
    if (excludePaths.some((p) => pathname.startsWith(p))) return;

    // Check if this is a markdown request
    if (!isMarkdownRequest(request)) return;

    // Rewrite to /md-mirror/... path
    const mdPath = `${prefix}${pathname === '/' ? '/index' : pathname}`;
    const rewriteUrl = new URL(mdPath, request.url);

    // Pass through query params (except v=md)
    for (const [key, value] of request.nextUrl.searchParams) {
      if (key !== 'v') {
        rewriteUrl.searchParams.set(key, value);
      }
    }

    return NextResponse.rewrite(rewriteUrl);
  };
}
