import { describe, expect, it } from 'vitest';
import { mapBlock } from '../../../src/mappers/block.js';
import {
  mapExchangeRateSet,
  mapNetworkNode,
  mapNetworkStake,
  mapSupply,
} from '../../../src/mappers/network.js';
import { mapSchedule } from '../../../src/mappers/schedule.js';
import { mapTopicMessage } from '../../../src/mappers/topic.js';
import {
  mapNftTransaction,
  mapTransaction,
  unwrapTransaction,
} from '../../../src/mappers/transaction.js';

const rawTransaction = {
  bytes: null,
  charged_tx_fee: '85046',
  consensus_timestamp: '1710000001.000000000',
  entity_id: '0.0.1234',
  max_fee: '200000000',
  memo_base64: '',
  name: 'CRYPTOTRANSFER',
  nft_transfers: [],
  node: '0.0.3',
  nonce: 0,
  parent_consensus_timestamp: null,
  result: 'SUCCESS',
  scheduled: false,
  staking_reward_transfers: [{ account: '0.0.800', amount: '100' }],
  token_transfers: [],
  transaction_hash: 'SGVsbG8=',
  transaction_id: '0.0.1234-1710000001-000000000',
  transfers: [{ account: '0.0.3', amount: '-100', is_approval: false }],
  valid_duration_seconds: '120',
  valid_start_timestamp: '1710000000.000000000',
};

describe('mapTransaction', () => {
  it('maps all fields correctly', () => {
    const result = mapTransaction(rawTransaction);
    expect(result.charged_tx_fee).toBe('85046');
    expect(result.entity_id).toBe('0.0.1234');
    expect(result.staking_reward_transfers).toHaveLength(1);
    expect(result.transfers[0].amount).toBe('-100');
  });

  it('handles null entity_id on failed transactions (EC39)', () => {
    const raw = { ...rawTransaction, entity_id: null, result: 'INVALID_ACCOUNT_ID' };
    const result = mapTransaction(raw);
    expect(result.entity_id).toBeNull();
  });
});

describe('unwrapTransaction', () => {
  it('unwraps { transactions: [...] } envelope (EC21/150/151)', () => {
    const wrapped = { transactions: [rawTransaction] };
    const result = unwrapTransaction(wrapped);
    expect(result.charged_tx_fee).toBe('85046');
  });

  it('throws on empty transactions array', () => {
    expect(() => unwrapTransaction({ transactions: [] })).toThrow('empty transactions array');
  });
});

describe('mapNftTransaction', () => {
  it('maps EC77 NFT transaction shape', () => {
    const raw = {
      consensus_timestamp: '1710000001.000000000',
      is_approval: false,
      nonce: 0,
      receiver_account_id: '0.0.1234',
      sender_account_id: '0.0.5678',
      transaction_id: '0.0.5678-1710000001-000000000',
      type: 'CRYPTOTRANSFER',
    };
    const result = mapNftTransaction(raw);
    expect(result.receiver_account_id).toBe('0.0.1234');
    expect(result.sender_account_id).toBe('0.0.5678');
    expect(result.type).toBe('CRYPTOTRANSFER');
  });
});

describe('mapBlock', () => {
  it('maps timestamp as TimestampRange (EC15/28)', () => {
    const raw = {
      count: 10,
      gas_used: '21000',
      hapi_version: '0.38.0',
      hash: '0xabc',
      logs_bloom: '0x',
      name: 'block',
      number: 100,
      previous_hash: '0xdef',
      size: 1024,
      timestamp: { from: '1710000000.000000000', to: '1710000002.000000000' },
    };
    const result = mapBlock(raw);
    expect(result.timestamp.from).toBe('1710000000.000000000');
    expect(result.timestamp.to).toBe('1710000002.000000000');
    expect(typeof result.timestamp).toBe('object');
  });
});

describe('mapSchedule', () => {
  it('maps single type (EC58 — list and detail identical)', () => {
    const raw = {
      admin_key: null,
      consensus_timestamp: null,
      creator_account_id: '0.0.1234',
      deleted: false,
      executed_timestamp: null,
      expiration_time: '1730000000.000000000',
      memo: 'test schedule',
      payer_account_id: '0.0.1234',
      schedule_id: '0.0.9999',
      signatures: [
        {
          consensus_timestamp: '1710000000.000000000',
          public_key_prefix: 'abc',
          signature: 'def',
          type: 'ED25519',
        },
      ],
      transaction_body: 'AQID',
      wait_for_expiry: false,
    };
    const result = mapSchedule(raw);
    expect(result.schedule_id).toBe('0.0.9999');
    expect(result.signatures).toHaveLength(1);
    expect(result.wait_for_expiry).toBe(false);
  });
});

describe('mapTopicMessage', () => {
  it('auto-decodes Base64 message and running_hash (EC3/18)', () => {
    const raw = {
      chunk_info: null,
      consensus_timestamp: '1710000001.000000000',
      message: 'SGVsbG8=', // "Hello"
      payer_account_id: '0.0.1234',
      running_hash: 'AAAA',
      running_hash_version: 3,
      sequence_number: '1',
      topic_id: '0.0.5678',
    };
    const result = mapTopicMessage(raw);
    expect(result.message).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(result.message)).toBe('Hello');
    expect(result.running_hash).toBeInstanceOf(Uint8Array);
  });

  it('handles chunk_info for chunked messages', () => {
    const raw = {
      chunk_info: {
        initial_transaction_id: {
          account_id: '0.0.1234',
          nonce: 0,
          scheduled: false,
          transaction_valid_start: '1710000000.000000000',
        },
        number: 1,
        total: 3,
      },
      consensus_timestamp: '1710000001.000000000',
      message: 'SGVsbG8=',
      payer_account_id: '0.0.1234',
      running_hash: 'AAAA',
      running_hash_version: 3,
      sequence_number: '1',
      topic_id: '0.0.5678',
    };
    const result = mapTopicMessage(raw);
    expect(result.chunk_info).not.toBeNull();
    expect(result.chunk_info?.total).toBe(3);
    expect(result.chunk_info?.number).toBe(1);
  });
});

describe('mapNetworkNode', () => {
  it('maps node_id as number (EC32) and stake as string (EC60)', () => {
    const raw = {
      admin_key: null,
      description: 'Test node',
      file_id: '0.0.102',
      max_stake: '50000000000000000',
      memo: '0.0.3',
      min_stake: '0',
      node_account_id: '0.0.3',
      node_id: 0,
      node_cert_hash: 'abc',
      public_key: '302a300506032b6570',
      reward_rate_start: '0',
      service_endpoints: [{ ip_address_v4: '35.237.200.180', port: 50211, domain_name: '' }],
      stake: '50000000000000000',
      stake_not_rewarded: '0',
      stake_rewarded: '50000000000000000',
      staking_period: { from: '1710000000.000000000', to: '1710086400.000000000' },
      timestamp: { from: '1700000000.000000000', to: null },
    };
    const result = mapNetworkNode(raw);
    expect(result.node_id).toBe(0);
    expect(typeof result.node_id).toBe('number');
    expect(result.stake).toBe('50000000000000000');
    expect(typeof result.stake).toBe('string');
    expect(result.timestamp.to).toBeNull();
  });
});

describe('mapNetworkStake', () => {
  it('maps all staking values as string (EC36)', () => {
    const raw = {
      max_stake_rewarded: '50000000000000000',
      max_staking_reward_rate_per_hbar: '100000',
      max_total_reward: '1000000000',
      node_reward_fee_fraction: 0,
      reserved_staking_rewards: '500000',
      reward_balance_threshold: '250000000000',
      stake_total: '50000000000000000',
      staking_period: { from: '1710000000.000000000', to: '1710086400.000000000' },
      staking_period_duration: '86400',
      staking_periods_stored: '365',
      staking_reward_fee_fraction: 0,
      staking_reward_rate: '100000',
      staking_start_threshold: '25000000000000000',
      unreserved_staking_reward_balance: '500000',
    };
    const result = mapNetworkStake(raw);
    expect(typeof result.stake_total).toBe('string');
    expect(typeof result.max_stake_rewarded).toBe('string');
  });
});

describe('mapExchangeRateSet', () => {
  it('maps current and next rates', () => {
    const raw = {
      current_rate: { cent_equivalent: 12, expiration_time: 1710000000, hbar_equivalent: 30000 },
      next_rate: { cent_equivalent: 13, expiration_time: 1710003600, hbar_equivalent: 30000 },
      timestamp: '1710000000.000000000',
    };
    const result = mapExchangeRateSet(raw);
    expect(result.current_rate.cent_equivalent).toBe(12);
    expect(result.next_rate.cent_equivalent).toBe(13);
  });
});

describe('mapSupply', () => {
  it('maps supply as strings (EC57)', () => {
    const raw = {
      released_supply: '3520000000000000000',
      timestamp: '1710000000.000000000',
      total_supply: '5000000000000000000',
    };
    const result = mapSupply(raw);
    expect(result.released_supply).toBe('3520000000000000000');
    expect(typeof result.released_supply).toBe('string');
  });
});
