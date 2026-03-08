/**
 * Network types for the Hiero Mirror Client SDK.
 *
 * @packageDocumentation
 */

import type { OperatorFilter, Order, TimestampRange } from './common.js';

// ---------------------------------------------------------------------------
// Network Node
// ---------------------------------------------------------------------------

/**
 * A consensus node in the Hedera network.
 *
 * EC32: `node_id` is a plain number, NOT `0.0.X` format.
 * EC60: `stake` is `string` (int64, may exceed MAX_SAFE_INTEGER).
 * EC28: `timestamp` is a `TimestampRange` (to can be null for active nodes).
 */
export interface NetworkNode {
  admin_key: unknown | null;
  description: string;
  file_id: string;
  max_stake: string;
  memo: string;
  min_stake: string;
  node_account_id: string;
  /** EC32: Plain number, not entity ID format. */
  node_id: number;
  node_cert_hash: string;
  public_key: string;
  reward_rate_start: string;
  service_endpoints: ServiceEndpoint[];
  /** EC60: String (int64, may exceed MAX_SAFE_INTEGER). */
  stake: string;
  stake_not_rewarded: string;
  stake_rewarded: string;
  staking_period: TimestampRange;
  /** EC28: `to` can be null for currently active nodes. */
  timestamp: TimestampRange;
}

export interface ServiceEndpoint {
  ip_address_v4: string;
  port: number;
  domain_name: string;
}

// ---------------------------------------------------------------------------
// Network Stake (EC36)
// ---------------------------------------------------------------------------

/**
 * Network staking information.
 *
 * EC36: All staking values as `string` (raw numbers exceed MAX_SAFE_INTEGER).
 */
export interface NetworkStake {
  max_stake_rewarded: string;
  max_staking_reward_rate_per_hbar: string;
  max_total_reward: string;
  node_reward_fee_fraction: number;
  reserved_staking_rewards: string;
  reward_balance_threshold: string;
  stake_total: string;
  staking_period: TimestampRange;
  staking_period_duration: string;
  staking_periods_stored: string;
  staking_reward_fee_fraction: number;
  staking_reward_rate: string;
  staking_start_threshold: string;
  unreserved_staking_reward_balance: string;
}

// ---------------------------------------------------------------------------
// Exchange Rate
// ---------------------------------------------------------------------------

export interface ExchangeRate {
  cent_equivalent: number;
  expiration_time: number;
  hbar_equivalent: number;
}

export interface ExchangeRateSet {
  current_rate: ExchangeRate;
  next_rate: ExchangeRate;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Supply (EC57 — already strings from API)
// ---------------------------------------------------------------------------

export interface Supply {
  released_supply: string;
  timestamp: string;
  total_supply: string;
}

// ---------------------------------------------------------------------------
// Fee Schedule
// ---------------------------------------------------------------------------

export interface Fee {
  gas: string;
  transaction_type: string;
}

export interface FeeSchedule {
  current?: Fee[];
  next?: Fee[];
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Query parameter types
// ---------------------------------------------------------------------------

export interface NetworkNodeParams {
  /** EC59: `file_id` is rejected by server. Not included. */
  limit?: number;
  'node.id'?: number | OperatorFilter<number>;
  order?: Order;
}

export interface NetworkFeeParams {
  order?: Order;
  timestamp?: string | OperatorFilter<string>;
}

export interface NetworkSupplyParams {
  timestamp?: string | OperatorFilter<string>;
}
