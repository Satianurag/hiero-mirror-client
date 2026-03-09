import { describe, expect, it } from 'vitest';
import { INTEGRATION_TIMEOUT, client } from './setup.js';

describe('Contracts Integration', { timeout: INTEGRATION_TIMEOUT }, () => {
  it('should list contracts', async () => {
    const page = await client.contracts.list({ limit: 1 });
    expect(Array.isArray(page.data)).toBe(true);
    if (page.data.length > 0) {
      expect(page.data[0]).toHaveProperty('contract_id');
    }
  });

  it('should list contract results', async () => {
    const page = await client.contracts.getResults({ limit: 2 });
    expect(Array.isArray(page.data)).toBe(true);
    if (page.data.length > 0) {
      const result = page.data[0];
      expect(result).toHaveProperty('contract_id');
      expect(result).toHaveProperty('gas_used');
      // EC136: gas fields are strings
      expect(typeof result.gas_used).toBe('string');
    }
  });
});
