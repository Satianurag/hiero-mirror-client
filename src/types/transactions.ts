/**
 * Transaction types for the Hiero Mirror Client SDK.
 *
 * - `Transaction` — from `/transactions` list/detail
 * - `NftTransaction` — from `/tokens/{id}/nfts/{serial}/transactions` (EC77)
 *
 * @packageDocumentation
 */

import type {
  NftTransfer,
  OperatorFilter,
  Order,
  StakingRewardTransfer,
  TokenTransfer,
  TransactionResult,
  Transfer,
} from './common.js';

// ---------------------------------------------------------------------------
// Transaction (from /transactions)
// ---------------------------------------------------------------------------

export interface Transaction {
  bytes: string | null;
  charged_tx_fee: string;
  consensus_timestamp: string;
  /** EC39: Null on failed transactions. */
  entity_id: string | null;
  max_fee: string;
  memo_base64: string;
  name: string;
  nft_transfers: NftTransfer[];
  node: string | null;
  nonce: number;
  parent_consensus_timestamp: string | null;
  result: string;
  scheduled: boolean;
  /** EC135: Always an array, never null or missing. */
  staking_reward_transfers: StakingRewardTransfer[];
  token_transfers: TokenTransfer[];
  /** Base64-encoded hash. Use `base64ToHex()` for `0x` format. */
  transaction_hash: string;
  transaction_id: string;
  transfers: Transfer[];
  valid_duration_seconds: string;
  valid_start_timestamp: string;
}

// ---------------------------------------------------------------------------
// NFT Transaction (EC77 — separate shape from Transaction)
// ---------------------------------------------------------------------------

/**
 * NFT-specific transaction from `/tokens/{id}/nfts/{serial}/transactions`.
 *
 * EC77: Has top-level `receiver_account_id` and `sender_account_id` fields
 * instead of nested `transfers`.
 */
export interface NftTransaction {
  consensus_timestamp: string;
  is_approval: boolean;
  nonce: number;
  receiver_account_id: string | null;
  sender_account_id: string | null;
  transaction_id: string;
  type: string;
}

// ---------------------------------------------------------------------------
// Query parameter types
// ---------------------------------------------------------------------------

export interface TransactionListParams {
  'account.id'?: string | OperatorFilter<string>;
  limit?: number;
  order?: Order;
  result?: TransactionResult;
  timestamp?: string | OperatorFilter<string>;
  /** EC127: Case-insensitive, normalized to UPPERCASE. */
  transactiontype?: string;
}

/**
 * Parameters for `transactions.get()`.
 *
 * EC124/125: `nonce` and `scheduled` are only valid on detail, NOT on list.
 */
export interface TransactionGetParams {
  nonce?: number;
  scheduled?: boolean;
}
