/**
 * @satianurag/hiero-mirror-client
 *
 * Standalone TypeScript client for the Hedera/Hiero Mirror Node REST API.
 *
 * @packageDocumentation
 */

export const VERSION = '__INJECT_VERSION__';

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
export type { Interceptors } from './http/client.js';
export type { ETagCacheOptions } from './http/etag-cache.js';
export type { PageExtractor, PaginatorOptions } from './pagination/paginator.js';
// Pagination
export { Paginator } from './pagination/paginator.js';
export type { TopicSSEStreamOptions } from './pagination/sse-stream.js';
export { TopicSSEStream } from './pagination/sse-stream.js';
export type { TopicStreamOptions } from './pagination/stream.js';
export { TopicStream } from './pagination/stream.js';

// Types (re-export everything from barrel)
export type * from './types/index.js';
