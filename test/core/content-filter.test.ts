import { describe, it, expect } from 'vitest';
import { parseHTML } from 'linkedom';
import { filterContent } from '../../src/core/content-filter.js';

function getFilteredHtml(html: string, options?: Parameters<typeof filterContent>[1]): string {
  const { document } = parseHTML(`<div id="root">${html}</div>`);
  const root = document.querySelector('#root')!;
  filterContent(root as unknown as Parameters<typeof filterContent>[0], options);
  return root.innerHTML;
}

describe('filterContent', () => {
  it('removes nav elements', () => {
    const result = getFilteredHtml('<nav><a href="/">Home</a></nav><p>Content</p>');
    expect(result).not.toContain('nav');
    expect(result).toContain('Content');
  });

  it('removes script and style elements', () => {
    const result = getFilteredHtml('<script>alert("hi")</script><style>.x{}</style><p>Content</p>');
    expect(result).not.toContain('script');
    expect(result).not.toContain('style');
    expect(result).toContain('Content');
  });

  it('removes elements with data-md-skip', () => {
    const result = getFilteredHtml('<div data-md-skip><p>Skip me</p></div><p>Keep me</p>');
    expect(result).not.toContain('Skip me');
    expect(result).toContain('Keep me');
  });

  it('removes aria-hidden elements', () => {
    const result = getFilteredHtml('<div aria-hidden="true">Hidden</div><p>Visible</p>');
    expect(result).not.toContain('Hidden');
    expect(result).toContain('Visible');
  });

  it('removes form elements', () => {
    const result = getFilteredHtml(
      '<form><input type="text"><button>Submit</button></form><p>Content</p>',
    );
    expect(result).not.toContain('form');
    expect(result).toContain('Content');
  });

  it('removes small images (icons)', () => {
    const result = getFilteredHtml(
      '<img src="icon.png" width="16" height="16"><img src="photo.jpg" width="800" height="600">',
    );
    expect(result).not.toContain('icon.png');
    expect(result).toContain('photo.jpg');
  });

  it('preserves explicitly included elements', () => {
    const result = getFilteredHtml(
      '<nav class="keep-me"><a href="/">Important nav</a></nav><nav>Remove me</nav>',
      { includeSelectors: ['.keep-me'] },
    );
    expect(result).toContain('Important nav');
    expect(result).not.toContain('Remove me');
  });

  it('removes custom exclude selectors', () => {
    const result = getFilteredHtml('<div class="sidebar">Sidebar</div><p>Content</p>', {
      excludeSelectors: ['.sidebar'],
    });
    expect(result).not.toContain('Sidebar');
    expect(result).toContain('Content');
  });
});
