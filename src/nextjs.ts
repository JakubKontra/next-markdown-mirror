// Next.js integration exports
export { withMarkdownMirror } from './nextjs/proxy.js';
export { createMarkdownHandler } from './nextjs/route-handler.js';
export { createLlmsTxtHandler, createLlmsFullTxtHandler } from './nextjs/llms-route.js';
export { buildMarkdownHeaders } from './nextjs/headers.js';

// Re-export core for convenience
export { HtmlToMarkdown } from './core/converter.js';
export { isMarkdownRequest } from './utils/detect-markdown-request.js';

// Types
export type {
  MarkdownMirrorConfig,
  ConversionResult,
  ContentSignal,
  LlmsPage,
  LlmsTxtConfig,
  ProxyConfig,
  RouteHandlerConfig,
} from './core/types.js';
