/**
 * @satianurag/hiero-mirror-client
 *
 * Standalone TypeScript client for the Hedera/Hiero Mirror Node REST API.
 *
 * @packageDocumentation
 */

/**
 * SDK version, injected at build time from package.json.
 * Falls back to 'development' for unbundled/test usage.
 */
export const VERSION: string =
  typeof __HIERO_VERSION__ !== 'undefined' ? __HIERO_VERSION__ : 'development';

export type { HieroNetwork, MirrorNodeClientOptions } from './client.js';
// Client
export { MirrorNodeClient } from './client.js';
// Errors (re-export the full hierarchy)
export {
  HieroCapabilityError,
  HieroError,
  HieroNetworkError,
  HieroNotFoundError,
  HieroParseError,
  HieroRateLimitError,
  HieroServerError,
  HieroTimeoutError,
  HieroValidationError,
} from './errors/index.js';
export type { AfterResponseHook, BeforeRequestHook } from './http/client.js';
export type { PageExtractor, PaginatorOptions } from './pagination/paginator.js';
// Pagination
export { Paginator } from './pagination/paginator.js';
export type { TopicStreamOptions } from './pagination/stream.js';
export { TopicStream } from './pagination/stream.js';

// Types (re-export everything from barrel)
export type * from './types/index.js';
