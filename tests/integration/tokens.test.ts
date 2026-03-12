import { describe, expect, it } from 'vitest';
import { client, INTEGRATION_TIMEOUT } from './setup.js';

describe('Tokens Integration', { timeout: INTEGRATION_TIMEOUT }, () => {
  let knownTokenId: string;

  it('should list tokens with pagination', async () => {
    const page = await client.tokens.list({ limit: 1 });
    expect(page.data).toHaveLength(1);
    expect(page.data[0]).toHaveProperty('token_id');
    expect(page.data[0]).toHaveProperty('type');
    expect(page.links.next).toBeTruthy();
    knownTokenId = page.data[0].token_id;
  });

  it('should get token detail with more fields than summary (EC23)', async () => {
    if (!knownTokenId) return;
    const detail = await client.tokens.get(knownTokenId);
    expect(detail.token_id).toBe(knownTokenId);
    // EC23: Detail has 29 keys vs summary's 7
    expect(detail).toHaveProperty('total_supply');
    expect(detail).toHaveProperty('treasury_account_id');
    expect(detail).toHaveProperty('custom_fees');
    // EC14/88: decimals always string
    expect(typeof detail.decimals).toBe('string');
  });

  it('should get token balances', async () => {
    if (!knownTokenId) return;
    const page = await client.tokens.getBalances(knownTokenId, { limit: 2 });
    expect(Array.isArray(page.data)).toBe(true);
  });
});
