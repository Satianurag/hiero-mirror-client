/**
 * @satianurag/hiero-mirror-client
 *
 * Standalone TypeScript client for the Hedera/Hiero Mirror Node REST API.
 *
 * @packageDocumentation
 */

import { createRequire } from 'node:module';
const _require = createRequire(import.meta.url);
const _pkg = _require('../package.json') as { version: string };
export const VERSION: string = _pkg.version;

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
export type { PageExtractor, PaginatorOptions } from './pagination/paginator.js';
// Pagination
export { Paginator } from './pagination/paginator.js';
export type { TopicStreamOptions } from './pagination/stream.js';
export { TopicStream } from './pagination/stream.js';

// Types (re-export everything from barrel)
export type * from './types/index.js';
