import { describe, expect, it } from 'vitest';
import { INTEGRATION_TIMEOUT, client } from './setup.js';

describe('Network Integration', { timeout: INTEGRATION_TIMEOUT }, () => {
  it('should get network stake with string int64 fields (EC36)', async () => {
    const stake = await client.network.getStake();
    expect(stake).toHaveProperty('stake_total');
    expect(typeof stake.stake_total).toBe('string');
    expect(typeof stake.max_stake_rewarded).toBe('string');
    expect(typeof stake.staking_reward_rate).toBe('string');
    // Verify these are numeric strings (not corrupted)
    expect(Number.isNaN(Number(stake.stake_total))).toBe(false);
  });

  it('should get network supply with string fields (EC57)', async () => {
    const supply = await client.network.getSupply();
    expect(supply).toHaveProperty('total_supply');
    expect(typeof supply.total_supply).toBe('string');
    expect(typeof supply.released_supply).toBe('string');
  });

  it('should get exchange rate with current and next rates', async () => {
    const rates = await client.network.getExchangeRate();
    expect(rates).toHaveProperty('current_rate');
    expect(rates).toHaveProperty('next_rate');
    expect(rates.current_rate).toHaveProperty('cent_equivalent');
    expect(rates.current_rate).toHaveProperty('hbar_equivalent');
    expect(typeof rates.current_rate.cent_equivalent).toBe('number');
  });

  it('should list network nodes with node_id as number (EC32)', async () => {
    const page = await client.network.getNodes({ limit: 2 });
    expect(page.data.length).toBeGreaterThan(0);
    const node = page.data[0];
    expect(typeof node.node_id).toBe('number');
    // EC60: stake is string (int64)
    expect(typeof node.stake).toBe('string');
    expect(node).toHaveProperty('node_account_id');
  });

  it('should get fee schedule', async () => {
    const fees = await client.network.getFees();
    expect(fees).toHaveProperty('timestamp');
  });
});
