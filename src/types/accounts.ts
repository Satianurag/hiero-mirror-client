/**
 * Account types for the Hiero Mirror Client SDK.
 *
 * - `AccountSummary` — returned by list endpoints (18 keys)
 * - `AccountDetail` — returned by detail endpoints (20 keys)
 *
 * @packageDocumentation
 */

import type {
  FreezeStatus,
  HieroKey,
  KycStatus,
  NftTransfer,
  OperatorFilter,
  Order,
  StakingRewardTransfer,
  TokenBalance,
  TokenTransfer,
  Transfer,
} from './common.js';

// ---------------------------------------------------------------------------
// Account Summary (list endpoint — 18 keys)
// ---------------------------------------------------------------------------

/**
 * Summary of an account returned by list endpoints.
 */
export interface AccountSummary {
  account: string;
  alias: string | null;
  auto_renew_period: string | null;
  balance: AccountBalance;
  created_timestamp: string | null;
  decline_reward: boolean;
  deleted: boolean;
  ethereum_nonce: string;
  evm_address: string | null;
  expiry_timestamp: string | null;
  key: HieroKey | null;
  max_automatic_token_associations: number;
  memo: string;
  pending_reward: string;
  receiver_sig_required: boolean | null;
  staked_account_id: string | null;
  /** EC137: Plain number, not `0.0.X` format (EC32). */
  staked_node_id: number | null;
  stake_period_start: string | null;
}

// ---------------------------------------------------------------------------
// Account Detail (detail endpoint — 20 keys, adds transactions + links)
// ---------------------------------------------------------------------------

/**
 * Detailed account information returned by detail endpoints.
 * Includes embedded recent transactions.
 */
export interface AccountDetail extends AccountSummary {
  /** Embedded recent transactions (sub-resource with own pagination). */
  transactions: AccountTransaction[];
  links: { next: string | null };
}

// ---------------------------------------------------------------------------
// Account Balance (nested object from `/accounts/{id}`, EC40/20)
// ---------------------------------------------------------------------------

/**
 * Nested balance object on account detail.
 *
 * EC40: This is NOT the same shape as `BalanceEntry` from `/balances`.
 */
export interface AccountBalance {
  balance: string;
  timestamp: string;
  tokens: TokenBalance[];
}

// ---------------------------------------------------------------------------
// Token Relationship (from `/accounts/{id}/tokens`, EC35)
// ---------------------------------------------------------------------------

/**
 * A token relationship for an account.
 */
export interface TokenRelationship {
  automatic_association: boolean;
  balance: string;
  created_timestamp: string;
  decimals: string;
  freeze_status: FreezeStatus;
  kyc_status: KycStatus;
  token_id: string;
}

// ---------------------------------------------------------------------------
// Staking Reward
// ---------------------------------------------------------------------------

/**
 * A staking reward payout for an account.
 */
export interface StakingReward {
  account_id: string;
  amount: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Allowances
// ---------------------------------------------------------------------------

/**
 * A crypto (HBAR) allowance.
 */
export interface CryptoAllowance {
  amount: string;
  amount_granted: string;
  owner: string;
  spender: string;
  timestamp: { from: string; to: string | null };
}

/**
 * A fungible token allowance.
 */
export interface TokenAllowance {
  amount: string;
  amount_granted: string;
  owner: string;
  spender: string;
  token_id: string;
  timestamp: { from: string; to: string | null };
}

/**
 * A non-fungible token (NFT) allowance.
 */
export interface NftAllowance {
  approved_for_all: boolean;
  owner: string;
  spender: string;
  token_id: string;
  timestamp: { from: string; to: string | null };
}

// ---------------------------------------------------------------------------
// Airdrops
// ---------------------------------------------------------------------------

/**
 * An airdrop associated with an account.
 */
export interface Airdrop {
  amount: string;
  receiver_id: string;
  sender_id: string;
  serial_number: string | null;
  token_id: string;
  timestamp: { from: string; to: string | null };
}

// ---------------------------------------------------------------------------
// Embedded account transaction (subset used in account detail response)
// ---------------------------------------------------------------------------

/**
 * Embedded transaction on the account detail endpoint.
 */
export interface AccountTransaction {
  bytes: string | null;
  charged_tx_fee: string;
  consensus_timestamp: string;
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
  staking_reward_transfers: StakingRewardTransfer[];
  token_transfers: TokenTransfer[];
  transaction_hash: string;
  transaction_id: string;
  transfers: Transfer[];
  valid_duration_seconds: string;
  valid_start_timestamp: string;
}

// ---------------------------------------------------------------------------
// Query parameter types
// ---------------------------------------------------------------------------

/**
 * Query parameters for listing accounts.
 */
export interface AccountListParams {
  'account.id'?: string | OperatorFilter<string>;
  'account.publickey'?: string;
  balance?: boolean;
  limit?: number;
  order?: Order;
}

/**
 * Query parameters for listing an account's tokens.
 */
export interface AccountTokensParams {
  'token.id'?: string | OperatorFilter<string>;
  limit?: number;
  order?: Order;
}

/**
 * Query parameters for listing an account's NFTs.
 */
export interface AccountNftsParams {
  'token.id'?: string | OperatorFilter<string>;
  serialnumber?: number;
  'spender.id'?: string | OperatorFilter<string>;
  limit?: number;
  order?: Order;
}

/**
 * Query parameters for listing an account's staking rewards.
 */
export interface AccountRewardsParams {
  timestamp?: string | OperatorFilter<string>;
  limit?: number;
  order?: Order;
}

/**
 * Query parameters for listing an account's crypto allowances.
 */
export interface AllowanceCryptoParams {
  'spender.id'?: string | OperatorFilter<string>;
  limit?: number;
  order?: Order;
}

/**
 * Query parameters for listing an account's token allowances.
 */
export interface AllowanceTokenParams {
  'spender.id'?: string | OperatorFilter<string>;
  'token.id'?: string | OperatorFilter<string>;
  limit?: number;
  order?: Order;
}

/**
 * Query parameters for listing an account's NFT allowances.
 */
export interface AllowanceNftParams {
  'account.id'?: string | OperatorFilter<string>;
  'token.id'?: string | OperatorFilter<string>;
  /** EC69: This is an Account ID string, NOT a boolean. */
  owner?: string;
  limit?: number;
  order?: Order;
}

/**
 * Query parameters for listing an account's airdrops.
 */
export interface AirdropParams {
  'receiver.id'?: string | OperatorFilter<string>;
  'sender.id'?: string | OperatorFilter<string>;
  'token.id'?: string | OperatorFilter<string>;
  serialnumber?: number;
  limit?: number;
  order?: Order;
}
