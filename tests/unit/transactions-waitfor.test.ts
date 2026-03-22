import { describe, expect, it, vi } from 'vitest';
import { TransactionsResource } from '../../src/resources/transactions.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const rawTransaction = {
  transactions: [
    {
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
      transaction_hash: 'abc',
      transaction_id: '0.0.1234-1710000000-000000000',
      transfers: [{ account: '0.0.1234', amount: -1000000, is_approval: false }],
      valid_duration_seconds: '120',
      valid_start_timestamp: '1710000000.000000000',
    },
  ],
};

function make404Error() {
  const err = new Error('Not found') as Error & { statusCode: number };
  err.statusCode = 404;
  return err;
}

// ---------------------------------------------------------------------------
// waitFor tests
// ---------------------------------------------------------------------------

describe('TransactionsResource.waitFor', () => {
  it('returns immediately if transaction exists', async () => {
    const mockClient = {
      get: vi.fn(async () => ({
        data: rawTransaction,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
      })),
    };
    const resource = new TransactionsResource(mockClient as never);
    const result = await resource.waitFor('0.0.1234-1710000000-000000000', {
      interval: 10,
      timeout: 5000,
    });
    expect(result.transaction_id).toBe('0.0.1234-1710000000-000000000');
    expect(mockClient.get).toHaveBeenCalledOnce();
  });

  it('polls on 404 and returns when transaction appears', async () => {
    let callCount = 0;
    const mockClient = {
      get: vi.fn(async () => {
        callCount++;
        if (callCount < 3) {
          throw make404Error();
        }
        return {
          data: rawTransaction,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
        };
      }),
    };
    const resource = new TransactionsResource(mockClient as never);
    const result = await resource.waitFor('0.0.1234-1710000000-000000000', {
      interval: 10,
      timeout: 5000,
    });
    expect(result.transaction_id).toBe('0.0.1234-1710000000-000000000');
    expect(mockClient.get).toHaveBeenCalledTimes(3);
  });

  it('throws on non-404 errors immediately', async () => {
    const mockClient = {
      get: vi.fn(async () => {
        const err = new Error('Server error') as Error & { statusCode: number };
        err.statusCode = 500;
        throw err;
      }),
    };
    const resource = new TransactionsResource(mockClient as never);
    await expect(
      resource.waitFor('0.0.1234-1710000000-000000000', { interval: 10, timeout: 5000 }),
    ).rejects.toThrow('Server error');
    expect(mockClient.get).toHaveBeenCalledOnce();
  });

  it('times out if transaction never appears', async () => {
    const mockClient = {
      get: vi.fn(async () => {
        throw make404Error();
      }),
    };
    const resource = new TransactionsResource(mockClient as never);
    await expect(
      resource.waitFor('0.0.1234-1710000000-000000000', { interval: 10, timeout: 50 }),
    ).rejects.toThrow('waitFor timed out');
  });

  it('respects abort signal — already aborted', async () => {
    const mockClient = {
      get: vi.fn(async () => {
        throw make404Error();
      }),
    };
    const controller = new AbortController();
    controller.abort();
    const resource = new TransactionsResource(mockClient as never);
    await expect(
      resource.waitFor('0.0.1234-1710000000-000000000', {
        interval: 10,
        timeout: 5000,
        signal: controller.signal,
      }),
    ).rejects.toThrow('aborted');
  });

  it('respects abort signal — aborted mid-poll', async () => {
    let callCount = 0;
    const controller = new AbortController();
    const mockClient = {
      get: vi.fn(async () => {
        callCount++;
        if (callCount === 2) {
          controller.abort();
        }
        throw make404Error();
      }),
    };
    const resource = new TransactionsResource(mockClient as never);
    await expect(
      resource.waitFor('0.0.1234-1710000000-000000000', {
        interval: 10,
        timeout: 5000,
        signal: controller.signal,
      }),
    ).rejects.toThrow();
  });

  it('uses default options when none provided', async () => {
    const mockClient = {
      get: vi.fn(async () => ({
        data: rawTransaction,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
      })),
    };
    const resource = new TransactionsResource(mockClient as never);
    const result = await resource.waitFor('0.0.1234-1710000000-000000000');
    expect(result.transaction_id).toBe('0.0.1234-1710000000-000000000');
  });
});
