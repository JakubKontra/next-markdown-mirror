const DEFAULT_SELECTORS = [
  'main',
  'article',
  '[role="main"]',
  '#content',
  '#main-content',
  '.main-content',
  '.post-content',
  '.entry-content',
  '.article-content',
];

/**
 * Find the main content element from the document using priority selectors.
 * Falls back to <body> if no selector matches.
 */
export function extractContent(
  document: { querySelector: (s: string) => unknown; body?: unknown },
  customSelectors?: string[],
): unknown {
  const selectors = customSelectors ?? DEFAULT_SELECTORS;

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }

  // Fallback to body
  return (document as { body: unknown }).body ?? document.querySelector('body');
}
