import { describe, expect, it } from 'vitest';
import {
  mapContractAction,
  mapContractResult,
  mapContractSummary,
} from '../../../src/mappers/contract.js';

describe('mapContractResult', () => {
  const rawResult = {
    access_list: null,
    address: '0x00000000000000000000000000000000000004d2',
    amount: '0',
    block_gas_used: '50000',
    block_hash: '0xabc123',
    block_number: 12345,
    bloom: '0x00',
    call_result: '0x0000',
    chain_id: '0x128',
    contract_id: '0.0.1234',
    created_contract_ids: [],
    error_message: null,
    failed_initcode: null,
    from: '0x00000000000000000000000000000000000004d2',
    function_parameters: '0x06fdde03',
    gas_consumed: '21000',
    gas_limit: '300000',
    gas_price: '0x',
    gas_used: '21000',
    hash: '0xdef456',
    logs: [],
    max_fee_per_gas: '0x',
    max_priority_fee_per_gas: '0x',
    nonce: 1,
    r: '0x1234',
    result: 'SUCCESS',
    s: '0x5678',
    state_changes: [
      {
        address: '0xaaa',
        contract_id: '0.0.1234',
        slot: '0x0',
        value_read: '0x01',
        value_written: '0x02',
      },
    ],
    status: '0x1',
    timestamp: '1710000000.000000000',
    to: '0x00000000000000000000000000000000000004d2',
    transaction_index: 0,
    type: 2,
    v: 1,
  };

  it('maps all 32 fields', () => {
    const result = mapContractResult(rawResult);
    expect(result.contract_id).toBe('0.0.1234');
    expect(result.gas_used).toBe('21000');
    expect(typeof result.gas_used).toBe('string');
    expect(result.state_changes).toHaveLength(1);
    expect(result.state_changes[0].value_written).toBe('0x02');
  });

  it('decodes hex error_message (EC24)', () => {
    const raw = { ...rawResult, error_message: '0x57524f4e475f4e4f4e4345' };
    const result = mapContractResult(raw);
    expect(result.error_message).toBe('0x57524f4e475f4e4f4e4345');
    expect(result.error_message_decoded).toBe('WRONG_NONCE');
  });

  it('handles null error_message', () => {
    const result = mapContractResult(rawResult);
    expect(result.error_message).toBeNull();
    expect(result.error_message_decoded).toBeNull();
  });

  it('handles null to address', () => {
    const raw = { ...rawResult, to: null };
    expect(mapContractResult(raw).to).toBeNull();
  });
});

describe('mapContractSummary', () => {
  it('maps 16-key summary', () => {
    const raw = {
      admin_key: null,
      auto_renew_account: null,
      auto_renew_period: '7776000',
      contract_id: '0.0.1234',
      created_timestamp: '1700000000.000000000',
      deleted: false,
      evm_address: '0x00000000000000000000000000000000000004d2',
      expiration_timestamp: '1730000000.000000000',
      file_id: null,
      max_automatic_token_associations: 0,
      memo: '',
      nonce: '0',
      obtainer_id: null,
      permanent_removal: null,
      proxy_account_id: null,
      timestamp: { from: '1700000000.000000000', to: null },
    };
    const result = mapContractSummary(raw);
    expect(result.contract_id).toBe('0.0.1234');
    expect(result.timestamp.from).toBe('1700000000.000000000');
    expect(result.timestamp.to).toBeNull();
  });
});

describe('mapContractAction', () => {
  it('maps all action fields', () => {
    const raw = {
      call_depth: 0,
      call_operation_type: 'CALL',
      call_type: 'CALL',
      caller: '0.0.1234',
      caller_type: 'ACCOUNT',
      from: '0xabc',
      gas: '300000',
      gas_used: '21000',
      index: 0,
      input: '0x06fdde03',
      recipient: '0.0.5678',
      recipient_type: 'CONTRACT',
      result_data: '0x0000',
      result_data_type: 'OUTPUT',
      timestamp: '1710000000.000000000',
      to: '0xdef',
      value: '0',
    };
    const result = mapContractAction(raw);
    expect(result.call_depth).toBe(0);
    expect(result.gas).toBe('300000');
  });
});
