/**
 * Topic types for the Hiero Mirror Client SDK.
 *
 * @packageDocumentation
 */

import type { OperatorFilter, Order } from './common.js';

// ---------------------------------------------------------------------------
// Topic Message
// ---------------------------------------------------------------------------

/**
 * A message published to a Hedera Consensus Service topic.
 *
 * EC3/18: `message` and `running_hash` are auto-decoded from Base64
 * to `Uint8Array` by the response mapper.
 */
export interface TopicMessage {
  chunk_info: ChunkInfo | null;
  consensus_timestamp: string;
  message: Uint8Array;
  payer_account_id: string;
  running_hash: Uint8Array;
  running_hash_version: number;
  sequence_number: string;
  topic_id: string;
}

// ---------------------------------------------------------------------------
// Chunk Info (for HCS chunked messages)
// ---------------------------------------------------------------------------

export interface ChunkInfo {
  initial_transaction_id: {
    account_id: string;
    nonce: number;
    scheduled: boolean;
    transaction_valid_start: string;
  };
  number: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Topic Info (from `/topics/{id}`)
// ---------------------------------------------------------------------------

export interface TopicInfo {
  admin_key: unknown | null;
  auto_renew_account: string | null;
  auto_renew_period: string | null;
  created_timestamp: string;
  deleted: boolean;
  memo: string;
  submit_key: unknown | null;
  timestamp: { from: string; to: string | null };
  topic_id: string;
}

// ---------------------------------------------------------------------------
// Query parameter types
// ---------------------------------------------------------------------------

export interface TopicMessageParams {
  /** EC44/72: `'base64'` (default) or `'utf-8'`. */
  encoding?: 'base64' | 'utf-8';
  limit?: number;
  order?: Order;
  sequencenumber?: number | OperatorFilter<number>;
  timestamp?: string | OperatorFilter<string>;
}
