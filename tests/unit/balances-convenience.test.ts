import { describe, expect, it, vi } from 'vitest';
import { BalancesResource } from '../../src/resources/balances.js';
import type { BalanceEntry } from '../../src/types/balances.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeBalanceEntry(overrides: Partial<BalanceEntry> = {}): BalanceEntry {
  return {
    account: '0.0.98',
    balance: '500000000000',
    tokens: [
      { token_id: '0.0.456', balance: '1000' },
      { token_id: '0.0.789', balance: '2000' },
    ],
    ...overrides,
  } as BalanceEntry;
}

function makeMockClient(entries: BalanceEntry[]) {
  return {
    get: vi.fn(async () => ({
      data: { balances: entries.map((e) => ({ ...e })) },
      status: 200,
    })),
  };
}

describe('BalancesResource.getForAccount', () => {
  it('returns the balance entry for an account', async () => {
    const entry = makeBalanceEntry();
    const mockClient = makeMockClient([entry]);

    const resource = new BalancesResource(mockClient as never);
    const result = await resource.getForAccount('0.0.98');

    expect(result.account).toBe('0.0.98');
    expect(result.balance).toBe('500000000000');
  });

  it('throws when account not found', async () => {
    const mockClient = makeMockClient([]);

    const resource = new BalancesResource(mockClient as never);

    await expect(resource.getForAccount('0.0.99999')).rejects.toThrow(
      'No balance found for account 0.0.99999',
    );
  });
});

describe('BalancesResource.getTokenBalance', () => {
  it('returns the token balance when found', async () => {
    const entry = makeBalanceEntry();
    const mockClient = makeMockClient([entry]);

    const resource = new BalancesResource(mockClient as never);
    const result = await resource.getTokenBalance('0.0.98', '0.0.456');

    expect(result).not.toBeNull();
    expect(result!.token_id).toBe('0.0.456');
    expect(result!.balance).toBe('1000');
  });

  it('returns null when token not held', async () => {
    const entry = makeBalanceEntry();
    const mockClient = makeMockClient([entry]);

    const resource = new BalancesResource(mockClient as never);
    const result = await resource.getTokenBalance('0.0.98', '0.0.99999');

    expect(result).toBeNull();
  });
});
