import { createLlmsTxtHandler } from 'next-markdown-mirror/nextjs';

export const GET = createLlmsTxtHandler({
  siteName: 'Markdown Mirror Test',
  baseUrl: 'http://localhost:3099',
  description: 'A test site for the next-markdown-mirror package',
  pages: [
    { url: 'http://localhost:3099/', title: 'Home', description: 'The home page' },
    {
      url: 'http://localhost:3099/about',
      title: 'About',
      description: 'About this project',
    },
  ],
});
