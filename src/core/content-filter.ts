interface ElementLike {
  tagName: string;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  querySelectorAll(selector: string): ArrayLike<ElementLike>;
  parentNode: { removeChild(child: unknown): void } | null;
  naturalWidth?: number;
  naturalHeight?: number;
  width?: number;
  height?: number;
}

const DEFAULT_EXCLUDE_TAGS = new Set([
  'NAV',
  'FOOTER',
  'HEADER',
  'FORM',
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'IFRAME',
  'SVG',
  'CANVAS',
  'TEMPLATE',
]);

const DEFAULT_EXCLUDE_SELECTORS = [
  '[data-md-skip]',
  '[aria-hidden="true"]',
  '.sr-only',
  '.visually-hidden',
  'button',
  'input',
  'select',
  'textarea',
];

/**
 * Remove non-content elements from a cloned DOM subtree.
 */
export function filterContent(
  root: ElementLike,
  options?: {
    excludeSelectors?: string[];
    includeSelectors?: string[];
  },
): void {
  const toRemove: ElementLike[] = [];

  // Collect elements matching include selectors (they should be preserved)
  const included = new Set<ElementLike>();
  if (options?.includeSelectors) {
    for (const sel of options.includeSelectors) {
      const matches = root.querySelectorAll(sel);
      for (let i = 0; i < matches.length; i++) {
        included.add(matches[i]);
      }
    }
  }

  // Remove default excluded tags
  for (const tag of DEFAULT_EXCLUDE_TAGS) {
    const els = root.querySelectorAll(tag.toLowerCase());
    for (let i = 0; i < els.length; i++) {
      if (!included.has(els[i])) {
        toRemove.push(els[i]);
      }
    }
  }

  // Remove default excluded selectors
  for (const sel of DEFAULT_EXCLUDE_SELECTORS) {
    const els = root.querySelectorAll(sel);
    for (let i = 0; i < els.length; i++) {
      if (!included.has(els[i])) {
        toRemove.push(els[i]);
      }
    }
  }

  // Remove custom excluded selectors
  if (options?.excludeSelectors) {
    for (const sel of options.excludeSelectors) {
      const els = root.querySelectorAll(sel);
      for (let i = 0; i < els.length; i++) {
        if (!included.has(els[i])) {
          toRemove.push(els[i]);
        }
      }
    }
  }

  // Remove small images (likely icons)
  const imgs = root.querySelectorAll('img');
  for (let i = 0; i < imgs.length; i++) {
    const img = imgs[i];
    const w = parseInt(img.getAttribute('width') ?? '0', 10);
    const h = parseInt(img.getAttribute('height') ?? '0', 10);
    if (w > 0 && h > 0 && w < 50 && h < 50) {
      toRemove.push(img);
    }
  }

  // Actually remove elements
  const removed = new Set<ElementLike>();
  for (const el of toRemove) {
    if (!removed.has(el) && el.parentNode) {
      el.parentNode.removeChild(el);
      removed.add(el);
    }
  }
}
