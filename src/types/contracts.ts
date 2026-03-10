/**
 * Contract types for the Hiero Mirror Client SDK.
 *
 * - `ContractSummary` — returned by list endpoints (16 keys)
 * - `ContractDetail` — returned by detail endpoints (18 keys)
 * - `ContractResult` — from `/contracts/results` (32 keys, EC136)
 *
 * @packageDocumentation
 */

import type { HieroKey, OperatorFilter, Order, TimestampRange } from './common.js';

// ---------------------------------------------------------------------------
// Contract Summary (list endpoint — 16 keys)
// ---------------------------------------------------------------------------

/**
 * Summary of a smart contract returned by list endpoints.
 */
export interface ContractSummary {
  admin_key: HieroKey | null;
  auto_renew_account: string | null;
  auto_renew_period: string | null;
  contract_id: string;
  created_timestamp: string;
  deleted: boolean;
  evm_address: string;
  expiration_timestamp: string | null;
  file_id: string | null;
  max_automatic_token_associations: number;
  memo: string;
  nonce: string;
  obtainer_id: string | null;
  permanent_removal: boolean | null;
  proxy_account_id: string | null;
  timestamp: TimestampRange;
}

// ---------------------------------------------------------------------------
// Contract Detail (detail endpoint — 18 keys, adds bytecode fields)
// ---------------------------------------------------------------------------

/**
 * Detailed smart contract information returned by detail endpoints.
 * Includes bytecode.
 */
export interface ContractDetail extends ContractSummary {
  bytecode: string;
  runtime_bytecode: string;
}

// ---------------------------------------------------------------------------
// Contract Result (EC136 — 32 keys, widest SDK type)
// ---------------------------------------------------------------------------

/**
 * Result of a smart contract execution (transaction).
 */
export interface ContractResult {
  access_list: string | null;
  address: string;
  amount: string;
  block_gas_used: string;
  block_hash: string;
  block_number: number;
  bloom: string;
  call_result: string | null;
  chain_id: string;
  contract_id: string | null;
  created_contract_ids: string[];
  error_message: string | null;
  /** Hex-decoded human-readable error (EC24). */
  error_message_decoded: string | null;
  failed_initcode: string | null;
  from: string;
  function_parameters: string;
  gas_consumed: string | null;
  gas_limit: string;
  gas_price: string;
  gas_used: string;
  hash: string;
  logs: ContractLog[];
  max_fee_per_gas: string;
  max_priority_fee_per_gas: string;
  nonce: number;
  r: string;
  result: string;
  s: string;
  state_changes: StateChange[];
  status: string;
  timestamp: string;
  to: string | null;
  transaction_index: number;
  type: number;
  v: number;
}

// ---------------------------------------------------------------------------
// Contract Log
// ---------------------------------------------------------------------------

/**
 * Event log emitted by a smart contract.
 */
export interface ContractLog {
  address: string;
  bloom: string;
  contract_id: string;
  data: string;
  index: number;
  /** EC138: 0-4 items, each `0x`-prefixed hex string. */
  topics: string[];
  root_contract_id: string | null;
  timestamp: string;
  block_hash: string;
  block_number: number;
  transaction_hash: string;
  transaction_index: number;
}

// ---------------------------------------------------------------------------
// State Change (EC33)
// ---------------------------------------------------------------------------

/**
 * Storage slot state change from a contract execution.
 */
export interface StateChange {
  address: string;
  contract_id: string;
  slot: string;
  value_read: string;
  /** Null for read-only accesses. */
  value_written: string | null;
}

// ---------------------------------------------------------------------------
// Contract Action
// ---------------------------------------------------------------------------

/**
 * Trace action from a contract execution.
 */
export interface ContractAction {
  call_depth: number;
  call_operation_type: string;
  call_type: string;
  caller: string;
  caller_type: string;
  from: string;
  gas: string;
  gas_used: string;
  index: number;
  input: string | null;
  recipient: string | null;
  recipient_type: string | null;
  result_data: string | null;
  result_data_type: string;
  timestamp: string;
  to: string | null;
  value: string;
}

// ---------------------------------------------------------------------------
// Contract Call (POST /contracts/call, EC29/51/130-133)
// ---------------------------------------------------------------------------

/**
 * Request body for `client.contracts.call()`.
 *
 * EC132: `value` is NOT accepted (read-only simulation).
 */
export interface ContractCallRequest {
  /** Block tag or number. Default: `"latest"` (EC130). */
  block?: string;
  data: string;
  estimate?: boolean;
  /** EC133: Optional sender address for simulation. */
  from?: string;
  /** EC131: Must be > 0. */
  gas?: number;
  gasPrice?: number;
  to: string;
}

/**
 * Response from a contract call simulation.
 */
export interface ContractCallResponse {
  result: string;
}

// ---------------------------------------------------------------------------
// Query parameter types
// ---------------------------------------------------------------------------

/**
 * Query parameters for listing contracts.
 */
export interface ContractListParams {
  'contract.id'?: string | OperatorFilter<string>;
  limit?: number;
  order?: Order;
}

/**
 * Query parameters for listing contract results.
 */
export interface ContractResultsParams {
  block_hash?: string;
  block_number?: number | OperatorFilter<number>;
  from?: string;
  internal?: boolean;
  limit?: number;
  order?: Order;
  timestamp?: string | OperatorFilter<string>;
  transaction_index?: number;
}

/**
 * Query parameters for listing contract logs.
 */
export interface ContractLogsParams {
  index?: number | OperatorFilter<number>;
  limit?: number;
  order?: Order;
  timestamp?: string | OperatorFilter<string>;
  topic0?: string | OperatorFilter<string>;
  topic1?: string | OperatorFilter<string>;
  topic2?: string | OperatorFilter<string>;
  topic3?: string | OperatorFilter<string>;
}

/**
 * Query parameters for reading contract state.
 */
export interface ContractStateParams {
  limit?: number;
  order?: Order;
  slot?: string | OperatorFilter<string>;
  timestamp?: string | OperatorFilter<string>;
}
