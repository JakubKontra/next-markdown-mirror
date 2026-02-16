import { stringify } from 'yaml';

interface DocumentLike {
  querySelectorAll(selector: string): ArrayLike<{ textContent: string | null }>;
}

/**
 * Extract JSON-LD data from script tags in the document.
 * Returns parsed objects and optional YAML frontmatter string.
 */
export function extractJsonLd(document: DocumentLike): {
  data: Record<string, unknown>[];
  frontmatter: string;
} {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  const data: Record<string, unknown>[] = [];

  for (let i = 0; i < scripts.length; i++) {
    const text = scripts[i].textContent;
    if (!text) continue;

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        data.push(...parsed);
      } else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
        // Handle @graph wrapper
        data.push(...(parsed['@graph'] as Record<string, unknown>[]));
      } else {
        data.push(parsed as Record<string, unknown>);
      }
    } catch {
      // Skip invalid JSON-LD
    }
  }

  if (data.length === 0) {
    return { data: [], frontmatter: '' };
  }

  // Build a clean frontmatter object from the most relevant JSON-LD
  const fm = buildFrontmatter(data);
  const frontmatter = fm ? `---\n${stringify(fm, { lineWidth: 120 }).trim()}\n---\n\n` : '';

  return { data, frontmatter };
}

function buildFrontmatter(items: Record<string, unknown>[]): Record<string, unknown> | null {
  // Find the most "page-like" item
  const pageTypes = [
    'WebPage',
    'Article',
    'BlogPosting',
    'NewsArticle',
    'Product',
    'FAQPage',
    'HowTo',
  ];

  let primary = items.find((item) => {
    const type = item['@type'];
    if (typeof type === 'string') return pageTypes.includes(type);
    if (Array.isArray(type))
      return type.some((t) => typeof t === 'string' && pageTypes.includes(t));
    return false;
  });

  if (!primary) primary = items[0];
  if (!primary) return null;

  const result: Record<string, unknown> = {};

  // Extract commonly useful fields
  const fields: [string, string][] = [
    ['@type', 'type'],
    ['name', 'title'],
    ['headline', 'title'],
    ['description', 'description'],
    ['datePublished', 'datePublished'],
    ['dateModified', 'dateModified'],
    ['url', 'url'],
    ['image', 'image'],
  ];

  for (const [src, dst] of fields) {
    if (primary[src] !== undefined && result[dst] === undefined) {
      const value = primary[src];
      // Simplify image objects to just URL
      if (dst === 'image' && typeof value === 'object' && value !== null) {
        const imgObj = value as Record<string, unknown>;
        if (imgObj['url']) {
          result[dst] = imgObj['url'];
          continue;
        }
      }
      result[dst] = value;
    }
  }

  // Extract author
  if (primary['author']) {
    const author = primary['author'];
    if (typeof author === 'object' && author !== null) {
      const authorObj = author as Record<string, unknown>;
      result['author'] = authorObj['name'] ?? authorObj['url'] ?? author;
    } else {
      result['author'] = author;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}
