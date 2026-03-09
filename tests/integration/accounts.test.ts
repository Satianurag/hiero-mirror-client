import { describe, expect, it } from 'vitest';
import { INTEGRATION_TIMEOUT, KNOWN_ACCOUNT, KNOWN_TOKEN_HOLDER, client } from './setup.js';

describe('Accounts Integration', { timeout: INTEGRATION_TIMEOUT }, () => {
  it('should list accounts with pagination', async () => {
    const page = await client.accounts.list({ limit: 2 });
    expect(page.data).toHaveLength(2);
    expect(page.data[0]).toHaveProperty('account');
    expect(page.data[0]).toHaveProperty('balance');
    expect(page.links.next).toBeTruthy();
  });

  it('should get a known account detail', async () => {
    const account = await client.accounts.get(KNOWN_ACCOUNT);
    expect(account.account).toBe(KNOWN_ACCOUNT);
    expect(typeof account.balance).toBe('object');
    // EC20: balance is a nested object, not a flat number
    expect(account.balance).toHaveProperty('balance');
    expect(account.balance).toHaveProperty('timestamp');
    expect(account.balance).toHaveProperty('tokens');
    expect(typeof account.balance.balance).toBe('string');
  });

  it('should get account tokens', async () => {
    const page = await client.accounts.getTokens(KNOWN_TOKEN_HOLDER, { limit: 2 });
    expect(Array.isArray(page.data)).toBe(true);
    if (page.data.length > 0) {
      const rel = page.data[0];
      expect(rel).toHaveProperty('token_id');
      expect(rel).toHaveProperty('balance');
      // EC14/88: decimals should always be a string
      expect(typeof rel.decimals).toBe('string');
    }
  });

  it('should get account rewards', async () => {
    const page = await client.accounts.getRewards(KNOWN_ACCOUNT, { limit: 2 });
    expect(Array.isArray(page.data)).toBe(true);
  });
});
