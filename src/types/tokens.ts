/**
 * Token types for the Hiero Mirror Client SDK.
 *
 * - `TokenSummary` — returned by list endpoints (7 keys, EC23)
 * - `TokenDetail` — returned by detail endpoints (29 keys, EC23)
 *
 * @packageDocumentation
 */

import type { HieroKey, OperatorFilter, Order, TokenType } from './common.js';

// ---------------------------------------------------------------------------
// Custom fee structures (EC26/73)
// ---------------------------------------------------------------------------

/**
 * A fractional fee amount.
 */
export interface FractionAmount {
  numerator: number;
  denominator: number;
}

/**
 * A fixed fee evaluated at transfer time.
 */
export interface FixedFee {
  all_collectors_are_exempt: boolean;
  amount: string;
  collector_account_id: string;
  denominating_token_id: string | null;
}

/**
 * A fractional fee evaluated at transfer time.
 */
export interface FractionalFee {
  all_collectors_are_exempt: boolean;
  amount: FractionAmount;
  collector_account_id: string;
  denominating_token_id: string | null;
  maximum: string | null;
  minimum: string;
  net_of_transfers: boolean;
}

/**
 * A royalty fee applied to NFT transfers.
 */
export interface RoyaltyFee {
  all_collectors_are_exempt: boolean;
  amount: FractionAmount;
  collector_account_id: string;
  fallback_fee: FixedFee | null;
}

/**
 * Custom fees configuration for a token.
 */
export interface CustomFees {
  created_timestamp: string;
  fixed_fees: FixedFee[];
  fractional_fees: FractionalFee[];
  royalty_fees: RoyaltyFee[];
}

// ---------------------------------------------------------------------------
// Token Summary (list endpoint — 7 keys, EC23)
// ---------------------------------------------------------------------------

/**
 * Summary of a token returned by list endpoints.
 */
export interface TokenSummary {
  admin_key: HieroKey | null;
  /** EC14/88: Always `string`, even though list returns `number`. */
  decimals: string;
  metadata: string;
  name: string;
  symbol: string;
  token_id: string;
  type: TokenType;
}

// ---------------------------------------------------------------------------
// Token Detail (detail endpoint — 29 keys, EC23)
// ---------------------------------------------------------------------------

/**
 * Detailed token information returned by detail endpoints.
 * Includes custom fees and key configuration.
 */
export interface TokenDetail extends TokenSummary {
  auto_renew_account: string | null;
  auto_renew_period: string | null;
  created_timestamp: string;
  custom_fees: CustomFees;
  deleted: boolean;
  expiry_timestamp: string | null;
  fee_schedule_key: HieroKey | null;
  freeze_default: boolean;
  freeze_key: HieroKey | null;
  initial_supply: string;
  kyc_key: HieroKey | null;
  max_supply: string;
  memo: string;
  metadata_key: HieroKey | null;
  modified_timestamp: string;
  pause_key: HieroKey | null;
  pause_status: string;
  supply_key: HieroKey | null;
  supply_type: string;
  total_supply: string;
  treasury_account_id: string;
  wipe_key: HieroKey | null;
}

// ---------------------------------------------------------------------------
// Token NFT
// ---------------------------------------------------------------------------

/**
 * Metadata and state of a single Non-Fungible Token (NFT).
 */
export interface TokenNft {
  account_id: string;
  created_timestamp: string;
  delegating_spender: string | null;
  deleted: boolean;
  metadata: string;
  modified_timestamp: string;
  serial_number: string;
  spender: string | null;
  token_id: string;
}

// ---------------------------------------------------------------------------
// Token Balance (from `/tokens/{id}/balances`)
// ---------------------------------------------------------------------------

/**
 * Balance entry for a specific token held by an account.
 */
export interface TokenBalanceEntry {
  account: string;
  balance: string;
  decimals: string;
}

/**
 * Response containing token balances.
 */
export interface TokenBalanceResponse {
  /** EC134: Can be null. */
  timestamp: string | null;
  balances: TokenBalanceEntry[];
  links: { next: string | null };
}

// ---------------------------------------------------------------------------
// Query parameter types
// ---------------------------------------------------------------------------

/**
 * Query parameters for listing tokens.
 */
export interface TokenListParams {
  'account.id'?: string;
  limit?: number;
  name?: string;
  order?: Order;
  publickey?: string;
  'token.id'?: string | OperatorFilter<string>;
  /** EC126: Case-insensitive, normalized to UPPERCASE. */
  type?: TokenType;
}

/**
 * Query parameters for listing NFTs of a token.
 */
export interface TokenNftListParams {
  'account.id'?: string | OperatorFilter<string>;
  limit?: number;
  order?: Order;
  /** EC129: No operators allowed on serialnumber for NFTs. */
  serialnumber?: number;
}

/**
 * Query parameters for listing accounts that hold a specific token.
 */
export interface TokenBalanceParams {
  'account.id'?: string | OperatorFilter<string>;
  timestamp?: string | OperatorFilter<string>;
  limit?: number;
  order?: Order;
}
