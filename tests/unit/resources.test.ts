import { describe, expect, it, vi } from 'vitest';
import { AccountsResource } from '../../src/resources/accounts.js';
import { BlocksResource } from '../../src/resources/blocks.js';
import { ContractsResource } from '../../src/resources/contracts.js';
import { NetworkResource } from '../../src/resources/network.js';
import { SchedulesResource } from '../../src/resources/schedules.js';
import { TokensResource } from '../../src/resources/tokens.js';
import { TopicsResource } from '../../src/resources/topics.js';

// ---------------------------------------------------------------------------
// Shared mock HttpClient factory
// ---------------------------------------------------------------------------

function makeMockClient(getResponse: unknown, postResponse?: unknown) {
  return {
    get: vi.fn(async () => ({
      data: getResponse,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
    })),
    post: vi.fn(async () => ({
      data: postResponse ?? getResponse,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
    })),
  };
}

// ---------------------------------------------------------------------------
// Raw fixtures
// ---------------------------------------------------------------------------

const rawAccount = {
  account: '0.0.1234',
  alias: 'CIQAAAH66',
  auto_renew_period: '7776000',
  balance: { balance: '100000000', timestamp: '1710000000.000000000', tokens: [] },
  created_timestamp: '1700000000.000000000',
  decline_reward: false,
  deleted: false,
  ethereum_nonce: '0',
  evm_address: '0x00000000000000000000000000000000000004d2',
  expiry_timestamp: '1730000000.000000000',
  key: null,
  max_automatic_token_associations: 0,
  memo: '',
  pending_reward: '0',
  receiver_sig_required: false,
  staked_account_id: null,
  staked_node_id: null,
  stake_period_start: null,
};

const rawAccountDetail = {
  ...rawAccount,
  transactions: [],
  links: { next: null },
};

const rawBlock = {
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

const rawContract = {
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

const rawContractDetail = {
  ...rawContract,
  bytecode: '0x608060',
  runtime_bytecode: '0x608060',
};

const rawContractResult = {
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
  state_changes: [],
  status: '0x1',
  timestamp: '1710000000.000000000',
  to: '0x00000000000000000000000000000000000004d2',
  transaction_index: 0,
  type: 2,
  v: 1,
};

const rawSchedule = {
  admin_key: null,
  consensus_timestamp: null,
  creator_account_id: '0.0.1234',
  deleted: false,
  executed_timestamp: null,
  expiration_time: '1730000000.000000000',
  memo: 'test',
  payer_account_id: '0.0.1234',
  schedule_id: '0.0.9999',
  signatures: [],
  transaction_body: 'AQID',
  wait_for_expiry: false,
};

const rawToken = {
  admin_key: null,
  decimals: '8',
  metadata: '',
  name: 'USDC',
  symbol: 'USDC',
  token_id: '0.0.5678',
  type: 'FUNGIBLE_COMMON',
};

const rawTokenDetail = {
  ...rawToken,
  auto_renew_account: '0.0.800',
  auto_renew_period: '7776000',
  created_timestamp: '1700000000.000000000',
  custom_fees: {
    created_timestamp: '1700000000.000000000',
    fixed_fees: [],
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
  memo: '',
  metadata_key: null,
  modified_timestamp: '1700000001.000000000',
  pause_key: null,
  pause_status: 'NOT_APPLICABLE',
  supply_key: null,
  supply_type: 'INFINITE',
  total_supply: '999000',
  treasury_account_id: '0.0.800',
  wipe_key: null,
};

const rawNft = {
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

const rawTopicInfo = {
  admin_key: null,
  auto_renew_account: null,
  auto_renew_period: '7776000',
  created_timestamp: '1700000000.000000000',
  deleted: false,
  memo: 'test topic',
  submit_key: null,
  timestamp: { from: '1700000000.000000000', to: null },
  topic_id: '0.0.5678',
};

const rawTopicMessage = {
  chunk_info: null,
  consensus_timestamp: '1710000001.000000000',
  message: 'SGVsbG8=',
  payer_account_id: '0.0.1234',
  running_hash: 'AAAA',
  running_hash_version: 3,
  sequence_number: '1',
  topic_id: '0.0.5678',
};

// ---------------------------------------------------------------------------
// AccountsResource
// ---------------------------------------------------------------------------
describe('AccountsResource', () => {
  it('get() fetches and maps an account detail', async () => {
    const mockClient = makeMockClient(rawAccountDetail);
    const resource = new AccountsResource(mockClient as never);
    const result = await resource.get('0.0.1234');
    expect(result.account).toBe('0.0.1234');
    expect(mockClient.get).toHaveBeenCalledOnce();
  });

  it('list() returns a Paginator', () => {
    const mockClient = makeMockClient({ accounts: [rawAccount], links: { next: null } });
    const resource = new AccountsResource(mockClient as never);
    const paginator = resource.list({ limit: 10 });
    expect(paginator).toBeDefined();
  });

  it('getNfts() fetches NFTs for an account', async () => {
    const mockClient = makeMockClient({ nfts: [rawNft], links: { next: null } });
    const resource = new AccountsResource(mockClient as never);
    const paginator = resource.getNFTs('0.0.1234');
    expect(paginator).toBeDefined();
  });

  it('getTokens() fetches token relationships for an account', async () => {
    const mockClient = makeMockClient({
      tokens: [
        {
          automatic_association: true,
          balance: '1000',
          created_timestamp: '1700000000.000000000',
          decimals: 8,
          freeze_status: 'NOT_APPLICABLE',
          kyc_status: 'NOT_APPLICABLE',
          token_id: '0.0.5678',
        },
      ],
      links: { next: null },
    });
    const resource = new AccountsResource(mockClient as never);
    const paginator = resource.getTokens('0.0.1234');
    expect(paginator).toBeDefined();
  });

  it('getRewards() returns a Paginator', () => {
    const mockClient = makeMockClient({ rewards: [], links: { next: null } });
    const resource = new AccountsResource(mockClient as never);
    const paginator = resource.getRewards('0.0.1234');
    expect(paginator).toBeDefined();
  });

  it('getCryptoAllowances() returns a Paginator', () => {
    const mockClient = makeMockClient({ allowances: [], links: { next: null } });
    const resource = new AccountsResource(mockClient as never);
    const paginator = resource.getCryptoAllowances('0.0.1234');
    expect(paginator).toBeDefined();
  });

  it('getTokenAllowances() returns a Paginator', () => {
    const mockClient = makeMockClient({ allowances: [], links: { next: null } });
    const resource = new AccountsResource(mockClient as never);
    const paginator = resource.getTokenAllowances('0.0.1234');
    expect(paginator).toBeDefined();
  });

  it('getNftAllowances() returns a Paginator', () => {
    const mockClient = makeMockClient({ allowances: [], links: { next: null } });
    const resource = new AccountsResource(mockClient as never);
    const paginator = resource.getNftAllowances('0.0.1234');
    expect(paginator).toBeDefined();
  });

  it('getPendingAirdrops() returns a Paginator', () => {
    const mockClient = makeMockClient({ airdrops: [], links: { next: null } });
    const resource = new AccountsResource(mockClient as never);
    const paginator = resource.getPendingAirdrops('0.0.1234');
    expect(paginator).toBeDefined();
  });

  it('getOutstandingAirdrops() returns a Paginator', () => {
    const mockClient = makeMockClient({ airdrops: [], links: { next: null } });
    const resource = new AccountsResource(mockClient as never);
    const paginator = resource.getOutstandingAirdrops('0.0.1234');
    expect(paginator).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// BlocksResource
// ---------------------------------------------------------------------------
describe('BlocksResource', () => {
  it('get() fetches and maps a block', async () => {
    const mockClient = makeMockClient(rawBlock);
    const resource = new BlocksResource(mockClient as never);
    const result = await resource.get(100);
    expect(result.number).toBe(100);
    expect(result.timestamp.from).toBe('1710000000.000000000');
  });

  it('get() works with string hash', async () => {
    const mockClient = makeMockClient(rawBlock);
    const resource = new BlocksResource(mockClient as never);
    const result = await resource.get('0xabc');
    expect(result.hash).toBe('0xabc');
  });

  it('list() returns a Paginator', () => {
    const mockClient = makeMockClient({ blocks: [rawBlock], links: { next: null } });
    const resource = new BlocksResource(mockClient as never);
    const paginator = resource.list({ limit: 5 });
    expect(paginator).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// ContractsResource
// ---------------------------------------------------------------------------
describe('ContractsResource', () => {
  it('get() fetches and maps contract detail', async () => {
    const mockClient = makeMockClient(rawContractDetail);
    const resource = new ContractsResource(mockClient as never);
    const result = await resource.get('0.0.1234');
    expect(result.contract_id).toBe('0.0.1234');
  });

  it('list() returns a Paginator', () => {
    const mockClient = makeMockClient({ contracts: [rawContract], links: { next: null } });
    const resource = new ContractsResource(mockClient as never);
    const paginator = resource.list({ limit: 5 });
    expect(paginator).toBeDefined();
  });

  it('call() performs a POST request', async () => {
    const mockClient = makeMockClient(null, { result: '0x0000' });
    const resource = new ContractsResource(mockClient as never);
    const result = await resource.call({
      block: 'latest',
      data: '0x06fdde03',
      estimate: false,
      from: '0x00000000000000000000000000000000000004d2',
      gas: 300000,
      gasPrice: 0,
      to: '0x00000000000000000000000000000000000004d2',
    });
    expect(mockClient.post).toHaveBeenCalledOnce();
    expect(result.result).toBe('0x0000');
  });

  it('getResults() returns a Paginator', () => {
    const mockClient = makeMockClient({ results: [], links: { next: null } });
    const resource = new ContractsResource(mockClient as never);
    const paginator = resource.getResults({ limit: 5 });
    expect(paginator).toBeDefined();
  });

  it('getResultByTimestamp() fetches a contract result', async () => {
    const mockClient = makeMockClient(rawContractResult);
    const resource = new ContractsResource(mockClient as never);
    const result = await resource.getResultByTimestamp('0.0.1234', '1710000000.000000000');
    expect(result.contract_id).toBe('0.0.1234');
  });

  it('getResultByTransactionIdOrHash() fetches a contract result', async () => {
    const mockClient = makeMockClient(rawContractResult);
    const resource = new ContractsResource(mockClient as never);
    const result = await resource.getResultByTransactionIdOrHash('0xdef456');
    expect(result.contract_id).toBe('0.0.1234');
  });

  it('getActions() returns a Paginator', () => {
    const mockClient = makeMockClient({ actions: [], links: { next: null } });
    const resource = new ContractsResource(mockClient as never);
    const paginator = resource.getActions('0xdef456');
    expect(paginator).toBeDefined();
  });

  it('getLogsByContract() returns a Paginator', () => {
    const mockClient = makeMockClient({ logs: [], links: { next: null } });
    const resource = new ContractsResource(mockClient as never);
    const paginator = resource.getLogsByContract('0.0.1234');
    expect(paginator).toBeDefined();
  });

  it('getLogs() returns a Paginator', () => {
    const mockClient = makeMockClient({ logs: [], links: { next: null } });
    const resource = new ContractsResource(mockClient as never);
    const paginator = resource.getLogs({ limit: 5 });
    expect(paginator).toBeDefined();
  });

  it('getState() returns a Paginator', () => {
    const mockClient = makeMockClient({ state: [], links: { next: null } });
    const resource = new ContractsResource(mockClient as never);
    const paginator = resource.getState('0.0.1234');
    expect(paginator).toBeDefined();
  });

  it('getResultsByContract() returns a Paginator', () => {
    const mockClient = makeMockClient({ results: [], links: { next: null } });
    const resource = new ContractsResource(mockClient as never);
    const paginator = resource.getResultsByContract('0.0.1234');
    expect(paginator).toBeDefined();
  });

  it('getOpcodes() fetches opcodes', async () => {
    const mockClient = makeMockClient({ opcodes: [] });
    const resource = new ContractsResource(mockClient as never);
    const result = await resource.getOpcodes('0xdef456');
    expect(result).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// NetworkResource
// ---------------------------------------------------------------------------
describe('NetworkResource', () => {
  it('getExchangeRate() fetches and maps exchange rates', async () => {
    const rawRate = {
      current_rate: { cent_equivalent: 12, expiration_time: 1710000000, hbar_equivalent: 30000 },
      next_rate: { cent_equivalent: 13, expiration_time: 1710003600, hbar_equivalent: 30000 },
      timestamp: '1710000000.000000000',
    };
    const mockClient = makeMockClient(rawRate);
    const resource = new NetworkResource(mockClient as never);
    const result = await resource.getExchangeRate();
    expect(result.current_rate.cent_equivalent).toBe(12);
  });

  it('getFees() fetches fee schedules', async () => {
    const rawFees = {
      current: {
        expiration_time: '1710000000.000000000',
        transaction_fee_schedule: [],
      },
      next: {
        expiration_time: '1710003600.000000000',
        transaction_fee_schedule: [],
      },
      timestamp: '1710000000.000000000',
    };
    const mockClient = makeMockClient(rawFees);
    const resource = new NetworkResource(mockClient as never);
    const result = await resource.getFees();
    expect(result).toBeDefined();
  });

  it('estimateFees() performs a POST', async () => {
    const mockClient = makeMockClient(null, { estimated_fees: [] });
    const resource = new NetworkResource(mockClient as never);
    const _result = await resource.estimateFees(new Uint8Array([1, 2, 3]));
    expect(mockClient.post).toHaveBeenCalledOnce();
  });

  it('getNodes() returns a Paginator', () => {
    const mockClient = makeMockClient({ nodes: [], links: { next: null } });
    const resource = new NetworkResource(mockClient as never);
    const paginator = resource.getNodes({ limit: 5 });
    expect(paginator).toBeDefined();
  });

  it('getStake() fetches network stake info', async () => {
    const rawStake = {
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
    const mockClient = makeMockClient(rawStake);
    const resource = new NetworkResource(mockClient as never);
    const result = await resource.getStake();
    expect(result.stake_total).toBe('50000000000000000');
  });

  it('getSupply() fetches network supply', async () => {
    const rawSupply = {
      released_supply: '3520000000000000000',
      timestamp: '1710000000.000000000',
      total_supply: '5000000000000000000',
    };
    const mockClient = makeMockClient(rawSupply);
    const resource = new NetworkResource(mockClient as never);
    const result = await resource.getSupply();
    expect(result.total_supply).toBe('5000000000000000000');
  });
});

// ---------------------------------------------------------------------------
// SchedulesResource
// ---------------------------------------------------------------------------
describe('SchedulesResource', () => {
  it('get() fetches and maps a schedule', async () => {
    const mockClient = makeMockClient(rawSchedule);
    const resource = new SchedulesResource(mockClient as never);
    const result = await resource.get('0.0.9999');
    expect(result.schedule_id).toBe('0.0.9999');
  });

  it('list() returns a Paginator', () => {
    const mockClient = makeMockClient({ schedules: [rawSchedule], links: { next: null } });
    const resource = new SchedulesResource(mockClient as never);
    const paginator = resource.list({ limit: 5 });
    expect(paginator).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// TokensResource
// ---------------------------------------------------------------------------
describe('TokensResource', () => {
  it('get() fetches and maps a token detail', async () => {
    const mockClient = makeMockClient(rawTokenDetail);
    const resource = new TokensResource(mockClient as never);
    const result = await resource.get('0.0.5678');
    expect(result.token_id).toBe('0.0.5678');
  });

  it('list() returns a Paginator', () => {
    const mockClient = makeMockClient({ tokens: [rawToken], links: { next: null } });
    const resource = new TokensResource(mockClient as never);
    const paginator = resource.list({ limit: 5 });
    expect(paginator).toBeDefined();
  });

  it('getBalances() returns a Paginator', () => {
    const mockClient = makeMockClient({ balances: [], links: { next: null } });
    const resource = new TokensResource(mockClient as never);
    const paginator = resource.getBalances('0.0.5678');
    expect(paginator).toBeDefined();
  });

  it('getNfts() returns a Paginator', () => {
    const mockClient = makeMockClient({ nfts: [rawNft], links: { next: null } });
    const resource = new TokensResource(mockClient as never);
    const paginator = resource.getNFTs('0.0.5678');
    expect(paginator).toBeDefined();
  });

  it('getNFTBySerial() fetches a specific NFT by serial', async () => {
    const mockClient = makeMockClient(rawNft);
    const resource = new TokensResource(mockClient as never);
    const result = await resource.getNFTBySerial('0.0.5678', 1);
    expect(result.serial_number).toBe('1');
  });

  it('getNFTTransactions() returns a Paginator', () => {
    const mockClient = makeMockClient({ transactions: [], links: { next: null } });
    const resource = new TokensResource(mockClient as never);
    const paginator = resource.getNFTTransactions('0.0.5678', 1);
    expect(paginator).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// TopicsResource
// ---------------------------------------------------------------------------
describe('TopicsResource', () => {
  it('get() fetches and maps topic info', async () => {
    const mockClient = makeMockClient(rawTopicInfo);
    const resource = new TopicsResource(mockClient as never);
    const result = await resource.get('0.0.5678');
    expect(result.topic_id).toBe('0.0.5678');
  });

  it('getMessages() returns a Paginator', () => {
    const mockClient = makeMockClient({ messages: [rawTopicMessage], links: { next: null } });
    const resource = new TopicsResource(mockClient as never);
    const paginator = resource.getMessages('0.0.5678');
    expect(paginator).toBeDefined();
  });

  it('getMessageBySequence() fetches a specific message', async () => {
    const mockClient = makeMockClient(rawTopicMessage);
    const resource = new TopicsResource(mockClient as never);
    const result = await resource.getMessageBySequence('0.0.5678', 1);
    expect(result.sequence_number).toBe('1');
  });

  it('getMessageByTimestamp() fetches a message by timestamp', async () => {
    const mockClient = makeMockClient(rawTopicMessage);
    const resource = new TopicsResource(mockClient as never);
    const result = await resource.getMessageByTimestamp('1710000001.000000000');
    expect(result.consensus_timestamp).toBe('1710000001.000000000');
  });

  it('stream() returns a TopicStream', () => {
    const mockClient = makeMockClient({ messages: [], links: { next: null } });
    const resource = new TopicsResource(mockClient as never);
    const stream = resource.stream('0.0.5678', { startTimestamp: '0', limit: 5 });
    expect(stream).toBeDefined();
  });
});
