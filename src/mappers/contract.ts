/**
 * Contract response mappers.
 * @internal
 */

import type { HieroKey, TimestampRange } from '../types/common.js';
import type {
  ContractAction,
  ContractDetail,
  ContractLog,
  ContractResult,
  ContractSummary,
  StateChange,
} from '../types/contracts.js';
import { arr, asRecord, bool, decodeHexString, num, str, strReq } from './common.js';

function mapKey(raw: unknown): HieroKey | null {
  if (raw == null) return null;
  const r = asRecord(raw);
  return { _type: strReq(r, '_type'), key: strReq(r, 'key') } as HieroKey;
}

function mapTimestampRange(raw: unknown): TimestampRange {
  const r = asRecord(raw);
  return { from: strReq(r, 'from'), to: str(r, 'to') };
}

export function mapContractSummary(raw: unknown): ContractSummary {
  const r = asRecord(raw);
  return {
    admin_key: mapKey(r.admin_key),
    auto_renew_account: str(r, 'auto_renew_account'),
    auto_renew_period: str(r, 'auto_renew_period'),
    contract_id: strReq(r, 'contract_id'),
    created_timestamp: strReq(r, 'created_timestamp'),
    deleted: bool(r, 'deleted'),
    evm_address: strReq(r, 'evm_address'),
    expiration_timestamp: str(r, 'expiration_timestamp'),
    file_id: str(r, 'file_id'),
    max_automatic_token_associations: num(r, 'max_automatic_token_associations'),
    memo: strReq(r, 'memo'),
    nonce: strReq(r, 'nonce'),
    obtainer_id: str(r, 'obtainer_id'),
    permanent_removal: r.permanent_removal == null ? null : bool(r, 'permanent_removal'),
    proxy_account_id: str(r, 'proxy_account_id'),
    timestamp: mapTimestampRange(r.timestamp),
  };
}

export function mapContractDetail(raw: unknown): ContractDetail {
  const r = asRecord(raw);
  const summary = mapContractSummary(raw);
  return {
    ...summary,
    bytecode: strReq(r, 'bytecode'),
    runtime_bytecode: strReq(r, 'runtime_bytecode'),
  };
}

export function mapContractLog(raw: unknown): ContractLog {
  const r = asRecord(raw);
  return {
    address: strReq(r, 'address'),
    bloom: strReq(r, 'bloom'),
    contract_id: strReq(r, 'contract_id'),
    data: strReq(r, 'data'),
    index: num(r, 'index'),
    topics: arr<string>(r, 'topics'),
    root_contract_id: str(r, 'root_contract_id'),
    timestamp: strReq(r, 'timestamp'),
    block_hash: strReq(r, 'block_hash'),
    block_number: num(r, 'block_number'),
    transaction_hash: strReq(r, 'transaction_hash'),
    transaction_index: num(r, 'transaction_index'),
  };
}

function mapStateChange(raw: unknown): StateChange {
  const r = asRecord(raw);
  return {
    address: strReq(r, 'address'),
    contract_id: strReq(r, 'contract_id'),
    slot: strReq(r, 'slot'),
    value_read: strReq(r, 'value_read'),
    value_written: str(r, 'value_written'),
  };
}

export function mapContractResult(raw: unknown): ContractResult {
  const r = asRecord(raw);
  const errorMessage = str(r, 'error_message');
  return {
    access_list: str(r, 'access_list'),
    address: strReq(r, 'address'),
    amount: strReq(r, 'amount'),
    block_gas_used: strReq(r, 'block_gas_used'),
    block_hash: strReq(r, 'block_hash'),
    block_number: num(r, 'block_number'),
    bloom: strReq(r, 'bloom'),
    call_result: str(r, 'call_result'),
    chain_id: strReq(r, 'chain_id'),
    contract_id: str(r, 'contract_id'),
    created_contract_ids: arr<string>(r, 'created_contract_ids'),
    error_message: errorMessage,
    /** EC24: Hex-decoded human-readable error. */
    error_message_decoded: decodeHexString(errorMessage),
    failed_initcode: str(r, 'failed_initcode'),
    from: strReq(r, 'from'),
    function_parameters: strReq(r, 'function_parameters'),
    gas_consumed: str(r, 'gas_consumed'),
    gas_limit: strReq(r, 'gas_limit'),
    gas_price: strReq(r, 'gas_price'),
    gas_used: strReq(r, 'gas_used'),
    hash: strReq(r, 'hash'),
    logs: arr(r, 'logs').map(mapContractLog),
    max_fee_per_gas: strReq(r, 'max_fee_per_gas'),
    max_priority_fee_per_gas: strReq(r, 'max_priority_fee_per_gas'),
    nonce: num(r, 'nonce'),
    r: strReq(r, 'r'),
    result: strReq(r, 'result'),
    s: strReq(r, 's'),
    state_changes: arr(r, 'state_changes').map(mapStateChange),
    status: strReq(r, 'status'),
    timestamp: strReq(r, 'timestamp'),
    to: str(r, 'to'),
    transaction_index: num(r, 'transaction_index'),
    type: num(r, 'type'),
    v: num(r, 'v'),
  };
}

export function mapContractAction(raw: unknown): ContractAction {
  const r = asRecord(raw);
  return {
    call_depth: num(r, 'call_depth'),
    call_operation_type: strReq(r, 'call_operation_type'),
    call_type: strReq(r, 'call_type'),
    caller: strReq(r, 'caller'),
    caller_type: strReq(r, 'caller_type'),
    from: strReq(r, 'from'),
    gas: strReq(r, 'gas'),
    gas_used: strReq(r, 'gas_used'),
    index: num(r, 'index'),
    input: str(r, 'input'),
    recipient: str(r, 'recipient'),
    recipient_type: str(r, 'recipient_type'),
    result_data: str(r, 'result_data'),
    result_data_type: strReq(r, 'result_data_type'),
    timestamp: strReq(r, 'timestamp'),
    to: str(r, 'to'),
    value: strReq(r, 'value'),
  };
}
