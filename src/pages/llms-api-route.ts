import type { LlmsTxtConfig, MarkdownMirrorConfig } from '../core/types.js';
import { generateLlmsTxt, generateLlmsFullTxt } from '../core/llms-txt-generator.js';

/** Minimal response shape compatible with NextApiResponse. */
interface PagesApiResponse {
  status(code: number): PagesApiResponse;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
}

/**
 * Create a Pages Router API route handler for /api/llms-txt
 *
 * Usage:
 *   // pages/api/llms-txt.ts
 *   import { createPagesLlmsTxtHandler } from 'next-markdown-mirror/pages';
 *   export default createPagesLlmsTxtHandler({
 *     siteName: 'My Site',
 *     baseUrl: 'https://example.com',
 *     pages: [{ url: '/about', title: 'About' }],
 *   });
 */
export function createPagesLlmsTxtHandler(config: LlmsTxtConfig) {
  return async function handler(_req: unknown, res: PagesApiResponse): Promise<void> {
    try {
      const content = await generateLlmsTxt(config);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).end(content);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate llms.txt';
      res.status(500).end(message);
    }
  };
}

/**
 * Create a Pages Router API route handler for /api/llms-full-txt
 *
 * Usage:
 *   // pages/api/llms-full-txt.ts
 *   import { createPagesLlmsFullTxtHandler } from 'next-markdown-mirror/pages';
 *   export default createPagesLlmsFullTxtHandler({
 *     siteName: 'My Site',
 *     baseUrl: 'https://example.com',
 *     pages: [{ url: '/about', title: 'About' }],
 *   });
 */
export function createPagesLlmsFullTxtHandler(
  llmsConfig: LlmsTxtConfig,
  _converterConfig?: MarkdownMirrorConfig,
) {
  return async function handler(_req: unknown, res: PagesApiResponse): Promise<void> {
    try {
      const fetchHtml = async (url: string): Promise<string> => {
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

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).end(content);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate llms-full.txt';
      res.status(500).end(message);
    }
  };
}
