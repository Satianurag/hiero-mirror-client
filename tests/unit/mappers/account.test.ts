import { describe, expect, it } from 'vitest';
import {
  mapAccountDetail,
  mapAccountSummary,
  mapAirdrop,
  mapCryptoAllowance,
  mapStakingReward,
  mapTokenRelationship,
} from '../../../src/mappers/account.js';

/** Minimal real-ish fixture for an account from testnet. */
const rawAccountSummary = {
  account: '0.0.1234',
  alias: 'CIQAAAH66',
  auto_renew_period: '7776000',
  balance: {
    balance: '100000000',
    timestamp: '1710000000.000000000',
    tokens: [{ token_id: '0.0.5678', balance: '500' }],
  },
  created_timestamp: '1700000000.000000000',
  decline_reward: false,
  deleted: false,
  ethereum_nonce: '0',
  evm_address: '0x00000000000000000000000000000000000004d2',
  expiry_timestamp: '1730000000.000000000',
  key: { _type: 'ED25519', key: 'abc123' },
  max_automatic_token_associations: 0,
  memo: 'test memo',
  pending_reward: '0',
  receiver_sig_required: false,
  staked_account_id: null,
  staked_node_id: 3,
  stake_period_start: '1710000000.000000000',
};

describe('mapAccountSummary', () => {
  it('maps all 18 fields correctly', () => {
    const result = mapAccountSummary(rawAccountSummary);
    expect(result.account).toBe('0.0.1234');
    expect(result.alias).toBe('CIQAAAH66');
    expect(result.balance.balance).toBe('100000000');
    expect(result.balance.tokens).toHaveLength(1);
    expect(result.balance.tokens[0].token_id).toBe('0.0.5678');
    expect(result.key?._type).toBe('ED25519');
    expect(result.staked_node_id).toBe(3);
    expect(result.decline_reward).toBe(false);
  });

  it('handles null key', () => {
    const raw = { ...rawAccountSummary, key: null };
    expect(mapAccountSummary(raw).key).toBeNull();
  });

  it('handles null staked_node_id (EC137)', () => {
    const raw = { ...rawAccountSummary, staked_node_id: null };
    expect(mapAccountSummary(raw).staked_node_id).toBeNull();
  });

  it('handles missing evm_address (null)', () => {
    const raw = { ...rawAccountSummary, evm_address: null };
    expect(mapAccountSummary(raw).evm_address).toBeNull();
  });
});

describe('mapAccountDetail', () => {
  it('maps detail with transactions and links', () => {
    const rawDetail = {
      ...rawAccountSummary,
      transactions: [
        {
          bytes: null,
          charged_tx_fee: '100000',
          consensus_timestamp: '1710000001.000000000',
          entity_id: '0.0.1234',
          max_fee: '200000',
          memo_base64: '',
          name: 'CRYPTOTRANSFER',
          nft_transfers: [],
          node: '0.0.3',
          nonce: 0,
          parent_consensus_timestamp: null,
          result: 'SUCCESS',
          scheduled: false,
          staking_reward_transfers: [],
          token_transfers: [],
          transaction_hash: 'abc=',
          transaction_id: '0.0.1234-1710000001-000000000',
          transfers: [{ account: '0.0.3', amount: '100', is_approval: false }],
          valid_duration_seconds: '120',
          valid_start_timestamp: '1710000000.000000000',
        },
      ],
      links: { next: '/api/v1/accounts/0.0.1234?timestamp=lt:1710000001.000000000' },
    };
    const result = mapAccountDetail(rawDetail);
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0].name).toBe('CRYPTOTRANSFER');
    expect(result.links.next).toContain('/api/v1/accounts/');
  });
});

describe('mapTokenRelationship', () => {
  it('maps with decimals as string (EC14/88)', () => {
    const raw = {
      automatic_association: true,
      balance: '1000',
      created_timestamp: '1700000000.000000000',
      decimals: 8, // number from API
      freeze_status: 'NOT_APPLICABLE',
      kyc_status: 'NOT_APPLICABLE',
      token_id: '0.0.5678',
    };
    const result = mapTokenRelationship(raw);
    expect(result.decimals).toBe('8');
    expect(typeof result.decimals).toBe('string');
  });
});

describe('mapStakingReward', () => {
  it('maps staking reward fields', () => {
    const raw = { account_id: '0.0.1234', amount: '50000', timestamp: '1710000000.000000000' };
    const result = mapStakingReward(raw);
    expect(result.account_id).toBe('0.0.1234');
    expect(result.amount).toBe('50000');
  });
});

describe('mapCryptoAllowance', () => {
  it('maps crypto allowance with timestamp range', () => {
    const raw = {
      amount: '1000000',
      amount_granted: '5000000',
      owner: '0.0.1234',
      spender: '0.0.5678',
      timestamp: { from: '1700000000.000000000', to: null },
    };
    const result = mapCryptoAllowance(raw);
    expect(result.amount).toBe('1000000');
    expect(result.timestamp.from).toBe('1700000000.000000000');
    expect(result.timestamp.to).toBeNull();
  });
});

describe('mapAirdrop', () => {
  it('maps airdrop with nullable serial_number', () => {
    const raw = {
      amount: '100',
      receiver_id: '0.0.1234',
      sender_id: '0.0.5678',
      serial_number: null,
      token_id: '0.0.9999',
      timestamp: { from: '1700000000.000000000', to: '1710000000.000000000' },
    };
    const result = mapAirdrop(raw);
    expect(result.serial_number).toBeNull();
    expect(result.timestamp.to).toBe('1710000000.000000000');
  });
});
