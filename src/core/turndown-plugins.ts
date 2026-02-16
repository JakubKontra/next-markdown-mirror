import type TurndownService from 'turndown';

/**
 * Register custom Turndown rules for elements not handled by default
 * or by turndown-plugin-gfm.
 */
export function registerCustomRules(turndown: TurndownService): void {
  // <dl>/<dt>/<dd> — definition lists
  turndown.addRule('definitionList', {
    filter: 'dl',
    replacement(_content, node) {
      const el = node as unknown as HTMLElement;
      const items: string[] = [];
      for (let i = 0; i < el.childNodes.length; i++) {
        const child = el.childNodes[i] as HTMLElement;
        if (!child.tagName) continue;
        const tag = child.tagName.toUpperCase();
        if (tag === 'DT') {
          items.push(`**${child.textContent?.trim() ?? ''}**`);
        } else if (tag === 'DD') {
          items.push(`: ${turndown.turndown(child.innerHTML ?? child.textContent ?? '')}`);
          items.push('');
        }
      }
      return '\n' + items.join('\n') + '\n';
    },
  });

  // Don't double-process dt/dd inside dl
  turndown.addRule('definitionTerm', {
    filter: ['dt', 'dd'],
    replacement(content, node) {
      const parent = (node as unknown as HTMLElement).parentNode as HTMLElement | null;
      if (parent?.tagName?.toUpperCase() === 'DL') {
        // Handled by dl rule
        return '';
      }
      const tag = (node as unknown as HTMLElement).tagName?.toUpperCase();
      if (tag === 'DT') return `**${content.trim()}**\n`;
      return `: ${content.trim()}\n`;
    },
  });

  // <details>/<summary>
  turndown.addRule('details', {
    filter: 'details',
    replacement(_content, node) {
      const el = node as unknown as HTMLElement;
      const summary = el.querySelector('summary');
      const summaryText = summary?.textContent?.trim() ?? 'Details';

      // Remove summary from content to avoid duplication
      const clone = el.cloneNode(true) as HTMLElement;
      const cloneSummary = clone.querySelector('summary');
      if (cloneSummary) cloneSummary.parentNode?.removeChild(cloneSummary);

      const body = turndown.turndown(clone.innerHTML ?? clone.textContent ?? '');

      return `\n<details>\n<summary>${summaryText}</summary>\n\n${body.trim()}\n\n</details>\n`;
    },
  });

  turndown.addRule('summary', {
    filter: 'summary',
    replacement() {
      // Handled by details rule
      return '';
    },
  });

  // <mark> — highlighted text
  turndown.addRule('mark', {
    filter: 'mark',
    replacement(content) {
      return `==${content}==`;
    },
  });

  // <abbr> — abbreviations
  turndown.addRule('abbr', {
    filter: 'abbr',
    replacement(content, node) {
      const title = (node as unknown as HTMLElement).getAttribute?.('title');
      if (title) {
        return `${content} (${title})`;
      }
      return content;
    },
  });

  // <figure>/<figcaption>
  turndown.addRule('figure', {
    filter: 'figure',
    replacement(_content, node) {
      const el = node as unknown as HTMLElement;
      const img = el.querySelector('img');
      const caption = el.querySelector('figcaption');
      const captionText = caption?.textContent?.trim() ?? '';

      if (img) {
        const src = img.getAttribute('src') ?? '';
        const alt = img.getAttribute('alt') ?? captionText;
        return `\n![${alt}](${src})\n${captionText ? `*${captionText}*\n` : ''}\n`;
      }

      // Non-image figure (code, etc.)
      const figContent = turndown.turndown(el.innerHTML ?? '');
      return `\n${figContent}\n${captionText ? `*${captionText}*\n` : ''}\n`;
    },
  });

  turndown.addRule('figcaption', {
    filter: 'figcaption',
    replacement() {
      // Handled by figure rule
      return '';
    },
  });

  // <q> — inline quotes
  turndown.addRule('inlineQuote', {
    filter: 'q',
    replacement(content) {
      return `"${content}"`;
    },
  });

  // <sub>/<sup>
  turndown.addRule('subscript', {
    filter: 'sub',
    replacement(content) {
      return `~${content}~`;
    },
  });

  turndown.addRule('superscript', {
    filter: 'sup',
    replacement(content) {
      return `^${content}^`;
    },
  });
}
