import { describe, it, expect } from 'vitest';
import { generateLlmsTxt, generateLlmsFullTxt } from '../../src/core/llms-txt-generator.js';

describe('generateLlmsTxt', () => {
  it('generates basic llms.txt', async () => {
    const result = await generateLlmsTxt({
      siteName: 'My Site',
      baseUrl: 'https://example.com',
      pages: [
        { url: 'https://example.com/', title: 'Home' },
        { url: 'https://example.com/about', title: 'About' },
        { url: 'https://example.com/docs', title: 'Documentation', description: 'API docs' },
      ],
    });

    expect(result).toContain('# My Site');
    expect(result).toContain('[Home](https://example.com/)');
    expect(result).toContain('[About](https://example.com/about)');
    expect(result).toContain('[Documentation](https://example.com/docs): API docs');
  });

  it('includes description', async () => {
    const result = await generateLlmsTxt({
      siteName: 'My Site',
      baseUrl: 'https://example.com',
      description: 'A great site',
      pages: [],
    });

    expect(result).toContain('> A great site');
  });

  it('groups pages by section', async () => {
    const result = await generateLlmsTxt({
      siteName: 'My Site',
      baseUrl: 'https://example.com',
      pages: [
        { url: '/home', title: 'Home' },
        { url: '/guide', title: 'Guide', section: 'docs' },
        { url: '/api', title: 'API Ref', section: 'docs' },
      ],
      sections: {
        docs: { title: 'Documentation', description: 'Guides and references' },
      },
    });

    expect(result).toContain('## Documentation');
    expect(result).toContain('> Guides and references');
    expect(result).toContain('[Guide](/guide)');
    expect(result).toContain('[API Ref](/api)');
  });
});

describe('generateLlmsFullTxt', () => {
  it('generates full text with inline markdown', async () => {
    const fetchFn = async (_url: string) =>
      '<html><body><main><h1>Hello</h1><p>World</p></main></body></html>';

    const result = await generateLlmsFullTxt(
      {
        siteName: 'My Site',
        baseUrl: 'https://example.com',
        pages: [{ url: 'https://example.com/page', title: 'Test Page' }],
      },
      fetchFn,
    );

    expect(result).toContain('# My Site');
    expect(result).toContain('## Test Page');
    expect(result).toContain('Source: https://example.com/page');
    expect(result).toContain('# Hello');
    expect(result).toContain('World');
  });

  it('handles fetch errors gracefully', async () => {
    const fetchFn = async (_url: string): Promise<string> => {
      throw new Error('Network error');
    };

    const result = await generateLlmsFullTxt(
      {
        siteName: 'My Site',
        baseUrl: 'https://example.com',
        pages: [{ url: 'https://example.com/page', title: 'Broken Page' }],
      },
      fetchFn,
    );

    expect(result).toContain('*Failed to convert this page.*');
  });
});
