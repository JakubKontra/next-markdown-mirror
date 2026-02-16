import { createMarkdownHandler } from 'markdown-mirror/nextjs';

export const GET = createMarkdownHandler({
  baseUrl: 'http://localhost:3099',
});
