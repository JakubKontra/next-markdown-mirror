import type { LlmsTxtConfig, MarkdownMirrorConfig } from '../core/types.js';
import { generateLlmsTxt, generateLlmsFullTxt } from '../core/llms-txt-generator.js';

/**
 * Create a Next.js route handler for /llms.txt
 *
 * Usage:
 *   // app/llms.txt/route.ts
 *   import { createLlmsTxtHandler } from 'markdown-mirror/nextjs';
 *   export const GET = createLlmsTxtHandler({
 *     siteName: 'My Site',
 *     baseUrl: 'https://example.com',
 *     pages: [{ url: '/about', title: 'About' }],
 *   });
 */
export function createLlmsTxtHandler(config: LlmsTxtConfig) {
  return async function GET(): Promise<Response> {
    try {
      const content = await generateLlmsTxt(config);
      return new Response(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate llms.txt';
      return new Response(message, { status: 500 });
    }
  };
}

/**
 * Create a Next.js route handler for /llms-full.txt
 *
 * Usage:
 *   // app/llms-full.txt/route.ts
 *   import { createLlmsFullTxtHandler } from 'markdown-mirror/nextjs';
 *   export const GET = createLlmsFullTxtHandler({
 *     siteName: 'My Site',
 *     baseUrl: 'https://example.com',
 *     pages: [{ url: '/about', title: 'About' }],
 *   });
 */
export function createLlmsFullTxtHandler(
  llmsConfig: LlmsTxtConfig,
  _converterConfig?: MarkdownMirrorConfig,
) {
  return async function GET(): Promise<Response> {
    try {
      const fetchHtml = async (url: string): Promise<string> => {
        // Resolve relative URLs
        const fullUrl = url.startsWith('http') ? url : new URL(url, llmsConfig.baseUrl).href;

        const response = await fetch(fullUrl, {
          headers: { Accept: 'text/html' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.status}`);
        }

        return response.text();
      };

      const content = await generateLlmsFullTxt(llmsConfig, fetchHtml);

      return new Response(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate llms-full.txt';
      return new Response(message, { status: 500 });
    }
  };
}
