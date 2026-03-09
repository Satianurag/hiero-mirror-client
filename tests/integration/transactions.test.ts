import { describe, expect, it } from 'vitest';
import { INTEGRATION_TIMEOUT, client } from './setup.js';

describe('Transactions Integration', { timeout: INTEGRATION_TIMEOUT }, () => {
  let knownTxId: string;

  it('should list transactions', async () => {
    const page = await client.transactions.list({ limit: 2 });
    expect(page.data.length).toBeGreaterThan(0);
    const tx = page.data[0];
    expect(tx).toHaveProperty('transaction_id');
    expect(tx).toHaveProperty('consensus_timestamp');
    expect(tx).toHaveProperty('transfers');
    expect(Array.isArray(tx.transfers)).toBe(true);
    knownTxId = tx.transaction_id;
  });

  it('should get a single transaction and unwrap envelope (EC21/150/151)', async () => {
    if (!knownTxId) return;
    const tx = await client.transactions.get(knownTxId);
    // EC21/150/151: .get() unwraps { transactions: [...] } envelope
    expect(tx).toHaveProperty('transaction_id');
    expect(tx.transaction_id).toBe(knownTxId);
    expect(tx).not.toHaveProperty('transactions'); // should be unwrapped
  });
});
