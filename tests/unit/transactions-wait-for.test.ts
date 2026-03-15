import { describe, expect, it, vi } from 'vitest';
import { TransactionsResource } from '../../src/resources/transactions.js';
import type { Transaction } from '../../src/types/transactions.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    bytes: null,
    charged_tx_fee: '100000',
    consensus_timestamp: '1710000000.000000000',
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
    transaction_hash: 'abc123',
    transaction_id: '0.0.100-1710000000-000000000',
    transfers: [],
    valid_duration_seconds: '120',
    valid_start_timestamp: '1710000000.000000000',
    ...overrides,
  } as Transaction;
}

function makeMockClient(responses: Array<{ data: unknown; status: number }>) {
  let callIndex = 0;
  return {
    get: vi.fn(async () => {
      const response = responses[callIndex] ?? responses[responses.length - 1];
      callIndex++;

      if (response.status === 404) {
        const error = new Error('Not Found') as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
      }

      return response;
    }),
  };
}

describe('TransactionsResource.waitFor', () => {
  it('returns immediately if transaction exists', async () => {
    const tx = makeTransaction();
    const mockClient = makeMockClient([{ data: { transactions: [tx] }, status: 200 }]);

    const resource = new TransactionsResource(mockClient as never);
    const result = await resource.waitFor('0.0.100-1710000000-000000000');

    expect(result.transaction_id).toBe('0.0.100-1710000000-000000000');
    expect(mockClient.get).toHaveBeenCalledTimes(1);
  });

  it('polls until transaction appears', async () => {
    const tx = makeTransaction();
    const mockClient = makeMockClient([
      { data: null, status: 404 },
      { data: null, status: 404 },
      { data: { transactions: [tx] }, status: 200 },
    ]);

    const resource = new TransactionsResource(mockClient as never);
    const result = await resource.waitFor('0.0.100-1710000000-000000000', {
      interval: 10,
    });

    expect(result.transaction_id).toBe('0.0.100-1710000000-000000000');
    expect(mockClient.get).toHaveBeenCalledTimes(3);
  });

  it('times out if transaction never appears', async () => {
    const mockClient = makeMockClient([{ data: null, status: 404 }]);

    const resource = new TransactionsResource(mockClient as never);

    await expect(
      resource.waitFor('0.0.100-1710000000-000000000', {
        interval: 10,
        timeout: 50,
      }),
    ).rejects.toThrow('timed out');
  });

  it('respects abort signal', async () => {
    const mockClient = makeMockClient([{ data: null, status: 404 }]);
    const controller = new AbortController();
    controller.abort();

    const resource = new TransactionsResource(mockClient as never);

    await expect(
      resource.waitFor('0.0.100-1710000000-000000000', {
        signal: controller.signal,
      }),
    ).rejects.toThrow('aborted');
  });

  it('rethrows non-404 errors', async () => {
    const mockClient = {
      get: vi.fn(async () => {
        const error = new Error('Server Error') as Error & { statusCode: number };
        error.statusCode = 500;
        throw error;
      }),
    };

    const resource = new TransactionsResource(mockClient as never);

    await expect(
      resource.waitFor('0.0.100-1710000000-000000000', { interval: 10 }),
    ).rejects.toThrow('Server Error');
  });
});
