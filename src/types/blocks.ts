/**
 * Block types for the Hiero Mirror Client SDK.
 *
 * @packageDocumentation
 */

import type { OperatorFilter, Order, TimestampRange } from './common.js';

// ---------------------------------------------------------------------------
// Block
// ---------------------------------------------------------------------------

/**
 * A block on the Hedera network.
 *
 * EC15/28: `timestamp` is a `TimestampRange` (object), NOT a string.
 * List and detail have the same shape (0 drift).
 */
export interface Block {
  count: number;
  gas_used: string;
  hapi_version: string;
  hash: string;
  logs_bloom: string;
  name: string;
  number: number;
  previous_hash: string;
  size: number;
  /** EC15/28: Object with `from` and `to` fields, not a string. */
  timestamp: TimestampRange;
}

// ---------------------------------------------------------------------------
// Query parameter types
// ---------------------------------------------------------------------------

export interface BlockListParams {
  /** EC90: Supports hex string block IDs in query. */
  'block.number'?: number | string | OperatorFilter<number | string>;
  limit?: number;
  order?: Order;
  timestamp?: string | OperatorFilter<string>;
}
