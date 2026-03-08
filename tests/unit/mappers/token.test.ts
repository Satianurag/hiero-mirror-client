import { describe, expect, it } from 'vitest';
import {
  mapTokenBalanceEntry,
  mapTokenDetail,
  mapTokenNft,
  mapTokenSummary,
} from '../../../src/mappers/token.js';

describe('mapTokenSummary', () => {
  const rawSummary = {
    admin_key: { _type: 'ED25519', key: 'abc123' },
    decimals: 18, // number from list endpoint (EC14/88)
    metadata: '',
    name: 'Test Token',
    symbol: 'TT',
    token_id: '0.0.5678',
    type: 'FUNGIBLE_COMMON',
  };

  it('maps all 7 fields', () => {
    const result = mapTokenSummary(rawSummary);
    expect(result.token_id).toBe('0.0.5678');
    expect(result.type).toBe('FUNGIBLE_COMMON');
    expect(result.name).toBe('Test Token');
  });

  it('coerces decimals to string (EC14/88)', () => {
    const result = mapTokenSummary(rawSummary);
    expect(result.decimals).toBe('18');
    expect(typeof result.decimals).toBe('string');
  });

  it('handles string decimals from detail endpoint', () => {
    const raw = { ...rawSummary, decimals: '8' };
    const result = mapTokenSummary(raw);
    expect(result.decimals).toBe('8');
  });

  it('handles null admin_key', () => {
    const raw = { ...rawSummary, admin_key: null };
    expect(mapTokenSummary(raw).admin_key).toBeNull();
  });
});

describe('mapTokenDetail', () => {
  it('maps the 29-key detail type', () => {
    const raw = {
      admin_key: null,
      decimals: '8',
      metadata: '',
      name: 'USDC',
      symbol: 'USDC',
      token_id: '0.0.456858',
      type: 'FUNGIBLE_COMMON',
      auto_renew_account: '0.0.800',
      auto_renew_period: '7776000',
      created_timestamp: '1700000000.000000000',
      custom_fees: {
        created_timestamp: '1700000000.000000000',
        fixed_fees: [
          {
            all_collectors_are_exempt: false,
            amount: '100',
            collector_account_id: '0.0.800',
            denominating_token_id: null,
          },
        ],
        fractional_fees: [],
        royalty_fees: [],
      },
      deleted: false,
      expiry_timestamp: '1730000000.000000000',
      fee_schedule_key: null,
      freeze_default: false,
      freeze_key: null,
      initial_supply: '1000000',
      kyc_key: null,
      max_supply: '0',
      memo: 'USDC Token',
      metadata_key: null,
      modified_timestamp: '1700000001.000000000',
      pause_key: null,
      pause_status: 'NOT_APPLICABLE',
      supply_key: { _type: 'ED25519', key: 'def456' },
      supply_type: 'INFINITE',
      total_supply: '999000',
      treasury_account_id: '0.0.800',
      wipe_key: null,
    };
    const result = mapTokenDetail(raw);
    expect(result.custom_fees.fixed_fees).toHaveLength(1);
    expect(result.custom_fees.fixed_fees[0].amount).toBe('100');
    expect(result.supply_key?._type).toBe('ED25519');
    expect(result.total_supply).toBe('999000');
  });
});

describe('mapTokenNft', () => {
  it('maps NFT with nullable spender', () => {
    const raw = {
      account_id: '0.0.1234',
      created_timestamp: '1700000000.000000000',
      delegating_spender: null,
      deleted: false,
      metadata: 'AQID',
      modified_timestamp: '1700000001.000000000',
      serial_number: '1',
      spender: null,
      token_id: '0.0.5678',
    };
    const result = mapTokenNft(raw);
    expect(result.serial_number).toBe('1');
    expect(result.spender).toBeNull();
  });
});

describe('mapTokenBalanceEntry', () => {
  it('coerces decimals to string', () => {
    const raw = { account: '0.0.1234', balance: '100', decimals: 8 };
    const result = mapTokenBalanceEntry(raw);
    expect(result.decimals).toBe('8');
    expect(typeof result.decimals).toBe('string');
  });
});
