/**
 * Detect whether a request is asking for Markdown content.
 * Checks:
 * 1. Accept header contains text/markdown
 * 2. Query parameter ?v=md
 */
export function isMarkdownRequest(request: {
  headers: { get(name: string): string | null };
  url: string;
}): boolean {
  // Check Accept header
  const accept = request.headers.get('accept') ?? '';
  if (accept.includes('text/markdown')) {
    return true;
  }

  // Check ?v=md query parameter
  try {
    const url = new URL(request.url);
    if (url.searchParams.get('v') === 'md') {
      return true;
    }
  } catch {
    // If URL parsing fails, skip query param check
  }

  return false;
}
