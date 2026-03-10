/**
 * Balance types for the Hiero Mirror Client SDK.
 *
 * EC40: `BalanceEntry` (from `/balances`) is completely different
 * from `AccountBalance` (from `/accounts/{id}`).
 *
 * @packageDocumentation
 */

import type { OperatorFilter, Order, TokenBalance } from './common.js';

// ---------------------------------------------------------------------------
// Balance Entry (from /balances — flat number shape)
// ---------------------------------------------------------------------------

/**
 * A balance entry from the global `/balances` endpoint.
 *
 * EC40: This is NOT the nested `AccountBalance` shape from `/accounts/{id}`.
 */
export interface BalanceEntry {
  account: string;
  balance: string;
  tokens: TokenBalance[];
}

// ---------------------------------------------------------------------------
// Query parameter types
// ---------------------------------------------------------------------------

/**
 * Query parameters for listing token balances.
 */
export interface BalanceListParams {
  'account.id'?: string | OperatorFilter<string>;
  'account.publickey'?: string;
  'account.balance'?: string | OperatorFilter<string>;
  timestamp?: string | OperatorFilter<string>;
  limit?: number;
  order?: Order;
}
