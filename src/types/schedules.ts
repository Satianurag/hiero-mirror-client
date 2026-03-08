/**
 * Schedule types for the Hiero Mirror Client SDK.
 *
 * EC58: List and detail have the same shape (12 keys) — single type.
 *
 * @packageDocumentation
 */

import type { HieroKey, OperatorFilter, Order } from './common.js';

// ---------------------------------------------------------------------------
// Schedule (same type for list and detail, EC58)
// ---------------------------------------------------------------------------

export interface Schedule {
  admin_key: HieroKey | null;
  consensus_timestamp: string | null;
  creator_account_id: string;
  deleted: boolean;
  executed_timestamp: string | null;
  expiration_time: string | null;
  memo: string;
  payer_account_id: string;
  schedule_id: string;
  signatures: ScheduleSignature[];
  transaction_body: string;
  wait_for_expiry: boolean;
}

export interface ScheduleSignature {
  consensus_timestamp: string;
  public_key_prefix: string;
  signature: string;
  type: string;
}

// ---------------------------------------------------------------------------
// Query parameter types
// ---------------------------------------------------------------------------

export interface ScheduleListParams {
  'account.id'?: string | OperatorFilter<string>;
  limit?: number;
  order?: Order;
  'schedule.id'?: string | OperatorFilter<string>;
}
