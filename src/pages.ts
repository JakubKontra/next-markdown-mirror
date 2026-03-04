// Pages Router integration exports
export { createMarkdownMiddleware } from './pages/middleware.js';
export { createPagesMarkdownHandler } from './pages/api-route-handler.js';
export {
  createPagesLlmsTxtHandler,
  createPagesLlmsFullTxtHandler,
} from './pages/llms-api-route.js';
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
