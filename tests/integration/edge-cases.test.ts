import { describe, expect, it } from 'vitest';
import { HieroError } from '../../src/errors/HieroError.js';
import { HieroNotFoundError } from '../../src/errors/HieroNotFoundError.js';
import { INTEGRATION_TIMEOUT, client } from './setup.js';

describe('Edge Cases Integration', { timeout: INTEGRATION_TIMEOUT }, () => {
  it('should throw HieroNotFoundError for non-existent account (EC47)', async () => {
    await expect(client.accounts.get('0.0.999999999')).rejects.toThrow(HieroNotFoundError);
  });

  it('should throw HieroError for invalid parameters', async () => {
    await expect(client.accounts.get('invalid-id-format!!!')).rejects.toThrow(HieroError);
  });

  it('should preserve int64 precision on network stake (EC36)', async () => {
    const stake = await client.network.getStake();
    const stakeTotal = stake.stake_total;
    // Must be a string, not a number (could exceed MAX_SAFE_INTEGER)
    expect(typeof stakeTotal).toBe('string');
    // Verify no precision loss: the string should be parseable
    expect(stakeTotal).toMatch(/^\d+$/);
  });

  it('should handle empty list responses gracefully', async () => {
    // Query for a very specific token that likely doesn't exist
    const page = await client.tokens.list({
      limit: 1,
      type: 'NON_FUNGIBLE_UNIQUE',
      name: 'zzz_nonexistent_token_xyz_12345',
    });
    expect(Array.isArray(page.data)).toBe(true);
    // Empty or non-empty, should not throw
  });

  it('should get blocks list', async () => {
    const page = await client.blocks.list({ limit: 1 });
    expect(page.data.length).toBeGreaterThan(0);
    const block = page.data[0];
    // EC15/28: timestamp is TimestampRange
    expect(block).toHaveProperty('timestamp');
    expect(block.timestamp).toHaveProperty('from');
  });

  it('should get schedules list', async () => {
    const page = await client.schedules.list({ limit: 1 });
    expect(Array.isArray(page.data)).toBe(true);
  });
});
