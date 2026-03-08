/**
 * Shared types used across all Hiero Mirror Client SDK resources.
 *
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/**
 * Pagination link container returned by list endpoints.
 */
export interface PaginationLinks {
  next: string | null;
}

/**
 * A page of results from a list endpoint.
 */
export interface Page<T> {
  data: T[];
  links: PaginationLinks;
}

// ---------------------------------------------------------------------------
// Ordering
// ---------------------------------------------------------------------------

/**
 * Sort order for list endpoints.
 *
 * The API accepts case-insensitive values but only `asc` and `desc`
 * are valid enums.
 */
export type Order = 'asc' | 'desc';

// ---------------------------------------------------------------------------
// Hex branded type
// ---------------------------------------------------------------------------

/**
 * A `0x`-prefixed hexadecimal string.
 *
 * This is a branded type alias — it is still a plain `string` at runtime
 * but provides additional type safety at the TypeScript level.
 */
export type Hex = string & { readonly __brand: 'Hex' };

// ---------------------------------------------------------------------------
// Timestamps
// ---------------------------------------------------------------------------

/**
 * A range timestamp used by blocks and network stake endpoints.
 *
 * `to` can be `null` for open-ended ranges (e.g., currently active nodes).
 *
 * EC28: `{ from: string; to: string | null }`
 */
export interface TimestampRange {
  from: string;
  to: string | null;
}

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------

/**
 * Discriminated union for Hedera public key types.
 *
 * EC27: Three variants based on `_type`:
 * - `ED25519` — 32-byte Ed25519 public key (64 hex chars)
 * - `ECDSA_SECP256K1` — 33-byte compressed ECDSA key (66 hex chars)
 * - `ProtobufEncoded` — opaque protobuf-serialized key structure
 */
export type HieroKey =
  | { _type: 'ED25519'; key: string }
  | { _type: 'ECDSA_SECP256K1'; key: string }
  | { _type: 'ProtobufEncoded'; key: string };

// ---------------------------------------------------------------------------
// Token balance (shared between accounts and balances)
// ---------------------------------------------------------------------------

/**
 * A single token balance entry.
 */
export interface TokenBalance {
  token_id: string;
  balance: string;
}

// ---------------------------------------------------------------------------
// Enum types
// ---------------------------------------------------------------------------

/**
 * Freeze status for token-account relationships (EC35).
 */
export type FreezeStatus = 'FROZEN' | 'UNFROZEN' | 'NOT_APPLICABLE';

/**
 * KYC status for token-account relationships (EC35).
 */
export type KycStatus = 'GRANTED' | 'REVOKED' | 'NOT_APPLICABLE';

/**
 * Filter for transaction result status.
 */
export type TransactionResult = 'success' | 'fail';

/**
 * Token types supported by the Hedera network.
 */
export type TokenType = 'FUNGIBLE_COMMON' | 'NON_FUNGIBLE_UNIQUE';

// ---------------------------------------------------------------------------
// Operator query helper
// ---------------------------------------------------------------------------

/**
 * An operator-based query filter.
 *
 * Allows expressing range/equality queries in the Stripe-style object pattern:
 * ```typescript
 * { timestamp: { gt: '1234', lte: '5678' } }
 * ```
 *
 * EC83/EC123: Supports all 6 operators: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`.
 */
export interface OperatorFilter<T = string> {
  eq?: T;
  ne?: T;
  gt?: T;
  gte?: T;
  lt?: T;
  lte?: T;
}

/**
 * A query parameter value that can be either a direct value or an operator filter.
 */
export type OperatorQuery<T = string> = T | OperatorFilter<T>;

// ---------------------------------------------------------------------------
// Logger (re-exported from http/client for public API)
// ---------------------------------------------------------------------------

/**
 * Optional logger interface.
 *
 * Compatible with `console`, `pino`, `winston`, or any object
 * with `debug/info/warn/error` methods.
 */
export interface Logger {
  debug?: (message: string, ...args: unknown[]) => void;
  info?: (message: string, ...args: unknown[]) => void;
  warn?: (message: string, ...args: unknown[]) => void;
  error?: (message: string, ...args: unknown[]) => void;
}

// ---------------------------------------------------------------------------
// Transfer types (shared in transactions)
// ---------------------------------------------------------------------------

/**
 * An HBAR transfer within a transaction.
 */
export interface Transfer {
  account: string;
  amount: string;
  is_approval: boolean;
}

/**
 * A token transfer within a transaction.
 */
export interface TokenTransfer {
  account: string;
  amount: string;
  is_approval: boolean;
  token_id: string;
}

/**
 * An NFT transfer within a transaction.
 */
export interface NftTransfer {
  is_approval: boolean;
  receiver_account_id: string | null;
  sender_account_id: string | null;
  serial_number: string;
  token_id: string;
}

/**
 * A staking reward transfer.
 *
 * EC135: Always an array (never null or missing).
 */
export interface StakingRewardTransfer {
  account: string;
  amount: string;
}
