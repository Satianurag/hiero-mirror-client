import { describe, expect, it, vi } from 'vitest';
import { mirrorNodeTools } from '../../src/mcp/tool-descriptors.js';

// ---------------------------------------------------------------------------
// Mock MirrorNodeClient with all resource groups
// ---------------------------------------------------------------------------

function makeMockClient() {
  return {
    accounts: {
      get: vi.fn(async () => ({ account: '0.0.98' })),
      list: vi.fn(async () => ({ data: [{ account: '0.0.98' }] })),
    },
    balances: {
      list: vi.fn(async () => ({ data: [{ account: '0.0.98', balance: '100' }] })),
    },
    tokens: {
      get: vi.fn(async () => ({ token_id: '0.0.5678' })),
      list: vi.fn(async () => ({ data: [{ token_id: '0.0.5678' }] })),
    },
    transactions: {
      get: vi.fn(async () => ({ transaction_id: '0.0.1234-1615422161-673238162' })),
      list: vi.fn(async () => ({ data: [{ transaction_id: '0.0.1234-1615422161-673238162' }] })),
    },
    schedules: {
      get: vi.fn(async () => ({ schedule_id: '0.0.9999' })),
    },
    topics: {
      get: vi.fn(async () => ({ topic_id: '0.0.5678' })),
      getMessages: vi.fn(async () => ({ data: [{ sequence_number: '1' }] })),
    },
    contracts: {
      get: vi.fn(async () => ({ contract_id: '0.0.1234' })),
    },
    blocks: {
      get: vi.fn(async () => ({ number: 12345 })),
    },
    network: {
      getExchangeRate: vi.fn(async () => ({ current_rate: {}, next_rate: {} })),
      getSupply: vi.fn(async () => ({ total_supply: '5000000000' })),
      getFees: vi.fn(async () => ({ current: {}, next: {} })),
      getStake: vi.fn(async () => ({ stake_total: '5000000000' })),
    },
  };
}

function findTool(name: string) {
  const tool = mirrorNodeTools.find((t) => t.name === name);
  if (!tool) throw new Error(`Tool "${name}" not found`);
  return tool;
}

// ---------------------------------------------------------------------------
// Execute function tests — one per tool
// ---------------------------------------------------------------------------

describe('MCP tool descriptors — execute functions', () => {
  it('hedera_get_account calls accounts.get', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_get_account');
    const result = await tool.execute(client as never, { accountId: '0.0.98' });
    expect(client.accounts.get).toHaveBeenCalledWith('0.0.98');
    expect(result).toEqual({ account: '0.0.98' });
  });

  it('hedera_list_accounts calls accounts.list with limit', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_list_accounts');
    const result = await tool.execute(client as never, { limit: '10' });
    expect(client.accounts.list).toHaveBeenCalledWith({ limit: 10 });
    expect(result).toEqual([{ account: '0.0.98' }]);
  });

  it('hedera_list_accounts calls accounts.list without limit', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_list_accounts');
    await tool.execute(client as never, {});
    expect(client.accounts.list).toHaveBeenCalledWith({ limit: undefined });
  });

  it('hedera_get_account_balance calls balances.list', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_get_account_balance');
    const result = await tool.execute(client as never, { accountId: '0.0.98' });
    expect(client.balances.list).toHaveBeenCalledWith({ 'account.id': '0.0.98', limit: 1 });
    expect(result).toEqual({ account: '0.0.98', balance: '100' });
  });

  it('hedera_get_account_balance returns null when no data', async () => {
    const client = makeMockClient();
    client.balances.list.mockResolvedValue({ data: [] });
    const tool = findTool('hedera_get_account_balance');
    const result = await tool.execute(client as never, { accountId: '0.0.999' });
    expect(result).toBeNull();
  });

  it('hedera_get_token calls tokens.get', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_get_token');
    const result = await tool.execute(client as never, { tokenId: '0.0.5678' });
    expect(client.tokens.get).toHaveBeenCalledWith('0.0.5678');
    expect(result).toEqual({ token_id: '0.0.5678' });
  });

  it('hedera_list_tokens calls tokens.list with limit', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_list_tokens');
    const result = await tool.execute(client as never, { limit: '5' });
    expect(client.tokens.list).toHaveBeenCalledWith({ limit: 5 });
    expect(result).toEqual([{ token_id: '0.0.5678' }]);
  });

  it('hedera_list_tokens calls tokens.list without limit', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_list_tokens');
    await tool.execute(client as never, {});
    expect(client.tokens.list).toHaveBeenCalledWith({ limit: undefined });
  });

  it('hedera_get_transaction calls transactions.get', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_get_transaction');
    const _result = await tool.execute(client as never, {
      transactionId: '0.0.1234@1615422161.673238162',
    });
    expect(client.transactions.get).toHaveBeenCalledWith('0.0.1234@1615422161.673238162');
  });

  it('hedera_list_transactions calls transactions.list with params', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_list_transactions');
    const result = await tool.execute(client as never, { accountId: '0.0.98', limit: '10' });
    expect(client.transactions.list).toHaveBeenCalledWith({ 'account.id': '0.0.98', limit: 10 });
    expect(result).toEqual([{ transaction_id: '0.0.1234-1615422161-673238162' }]);
  });

  it('hedera_list_transactions calls transactions.list without params', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_list_transactions');
    await tool.execute(client as never, {});
    expect(client.transactions.list).toHaveBeenCalledWith({
      'account.id': undefined,
      limit: undefined,
    });
  });

  it('hedera_get_schedule calls schedules.get', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_get_schedule');
    const result = await tool.execute(client as never, { scheduleId: '0.0.9999' });
    expect(client.schedules.get).toHaveBeenCalledWith('0.0.9999');
    expect(result).toEqual({ schedule_id: '0.0.9999' });
  });

  it('hedera_get_topic calls topics.get', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_get_topic');
    const result = await tool.execute(client as never, { topicId: '0.0.5678' });
    expect(client.topics.get).toHaveBeenCalledWith('0.0.5678');
    expect(result).toEqual({ topic_id: '0.0.5678' });
  });

  it('hedera_get_topic_messages calls topics.getMessages with limit', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_get_topic_messages');
    const result = await tool.execute(client as never, { topicId: '0.0.5678', limit: '10' });
    expect(client.topics.getMessages).toHaveBeenCalledWith('0.0.5678', { limit: 10 });
    expect(result).toEqual([{ sequence_number: '1' }]);
  });

  it('hedera_get_topic_messages calls topics.getMessages without limit', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_get_topic_messages');
    await tool.execute(client as never, { topicId: '0.0.5678' });
    expect(client.topics.getMessages).toHaveBeenCalledWith('0.0.5678', { limit: undefined });
  });

  it('hedera_get_contract calls contracts.get', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_get_contract');
    const result = await tool.execute(client as never, { contractId: '0.0.1234' });
    expect(client.contracts.get).toHaveBeenCalledWith('0.0.1234');
    expect(result).toEqual({ contract_id: '0.0.1234' });
  });

  it('hedera_get_block calls blocks.get', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_get_block');
    const result = await tool.execute(client as never, { blockNumberOrHash: '12345' });
    expect(client.blocks.get).toHaveBeenCalledWith('12345');
    expect(result).toEqual({ number: 12345 });
  });

  it('hedera_get_exchange_rate calls network.getExchangeRate', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_get_exchange_rate');
    await tool.execute(client as never, {});
    expect(client.network.getExchangeRate).toHaveBeenCalledOnce();
  });

  it('hedera_get_network_supply calls network.getSupply', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_get_network_supply');
    await tool.execute(client as never, {});
    expect(client.network.getSupply).toHaveBeenCalledOnce();
  });

  it('hedera_get_network_fees calls network.getFees', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_get_network_fees');
    await tool.execute(client as never, {});
    expect(client.network.getFees).toHaveBeenCalledOnce();
  });

  it('hedera_get_network_stake calls network.getStake', async () => {
    const client = makeMockClient();
    const tool = findTool('hedera_get_network_stake');
    await tool.execute(client as never, {});
    expect(client.network.getStake).toHaveBeenCalledOnce();
  });
});
