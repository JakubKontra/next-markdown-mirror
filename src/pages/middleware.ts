import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { ProxyConfig } from '../core/types.js';
import { isMarkdownRequest } from '../utils/detect-markdown-request.js';

// Default paths to exclude from markdown rewriting
const DEFAULT_EXCLUDE = [
  '/api/',
  '/_next/',
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
 * Create a Next.js middleware that detects markdown requests
 * and rewrites them to /api/md-mirror/...
 *
 * Usage:
 *   // middleware.ts
 *   import { createMarkdownMiddleware } from 'next-markdown-mirror/pages';
 *   export const middleware = createMarkdownMiddleware();
 *   export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
 */
export function createMarkdownMiddleware(config: ProxyConfig = {}) {
  const excludePaths = [...DEFAULT_EXCLUDE, ...(config.excludePaths ?? [])];
  const prefix = config.routePrefix ?? '/api/md-mirror';

  return function middleware(request: NextRequest): NextResponse | undefined {
    // Only process GET requests
    if (request.method !== 'GET') return NextResponse.next();

    const pathname = request.nextUrl.pathname;

    // Skip static files
    if (STATIC_EXT.test(pathname)) return NextResponse.next();

    // Skip excluded paths
    if (excludePaths.some((p) => pathname.startsWith(p))) return NextResponse.next();

    // Check if this is a markdown request
    if (!isMarkdownRequest(request)) return NextResponse.next();

    // Rewrite to /api/md-mirror/... path
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
