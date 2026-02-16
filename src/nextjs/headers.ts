import type { ContentSignal } from '../core/types.js';

/**
 * Build response headers for a Markdown response.
 */
export function buildMarkdownHeaders(options: {
  tokenCount: number;
  contentSignal?: ContentSignal;
}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'text/markdown; charset=utf-8',
    Vary: 'Accept',
    'x-markdown-tokens': String(options.tokenCount),
  };

  if (options.contentSignal) {
    headers['Content-Signal'] = options.contentSignal;
  }

  return headers;
}
