import { describe, expect, it } from 'vitest';
import { mirrorNodeTools } from '../../src/mcp/tool-descriptors.js';

describe('mirrorNodeTools', () => {
  it('exports a non-empty array of tool descriptors', () => {
    expect(Array.isArray(mirrorNodeTools)).toBe(true);
    expect(mirrorNodeTools.length).toBeGreaterThan(0);
  });

  it('every descriptor has required fields', () => {
    for (const tool of mirrorNodeTools) {
      expect(typeof tool.name).toBe('string');
      expect(tool.name.length).toBeGreaterThan(0);

      expect(typeof tool.description).toBe('string');
      expect(tool.description.length).toBeGreaterThan(0);

      expect(tool.inputSchema.type).toBe('object');
      expect(typeof tool.inputSchema.properties).toBe('object');
      expect(Array.isArray(tool.inputSchema.required)).toBe(true);

      expect(typeof tool.execute).toBe('function');
    }
  });

  it('all tool names are unique', () => {
    const names = mirrorNodeTools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('all tool names follow hedera_ convention', () => {
    for (const tool of mirrorNodeTools) {
      expect(tool.name).toMatch(/^hedera_/);
    }
  });

  it('required fields are defined in properties', () => {
    for (const tool of mirrorNodeTools) {
      for (const req of tool.inputSchema.required) {
        expect(tool.inputSchema.properties).toHaveProperty(req);
      }
    }
  });

  it('covers key resource areas', () => {
    const names = mirrorNodeTools.map((t) => t.name);

    // Accounts
    expect(names).toContain('hedera_get_account');
    expect(names).toContain('hedera_list_accounts');

    // Balances
    expect(names).toContain('hedera_get_account_balance');

    // Tokens
    expect(names).toContain('hedera_get_token');
    expect(names).toContain('hedera_list_tokens');

    // Transactions
    expect(names).toContain('hedera_get_transaction');
    expect(names).toContain('hedera_list_transactions');

    // Schedules
    expect(names).toContain('hedera_get_schedule');

    // Topics
    expect(names).toContain('hedera_get_topic');
    expect(names).toContain('hedera_get_topic_messages');

    // Contracts
    expect(names).toContain('hedera_get_contract');

    // Blocks
    expect(names).toContain('hedera_get_block');

    // Network
    expect(names).toContain('hedera_get_exchange_rate');
    expect(names).toContain('hedera_get_network_supply');
    expect(names).toContain('hedera_get_network_fees');
    expect(names).toContain('hedera_get_network_stake');
  });

  it('each property has type and description', () => {
    for (const tool of mirrorNodeTools) {
      for (const [, prop] of Object.entries(tool.inputSchema.properties)) {
        expect(typeof prop.type).toBe('string');
        expect(typeof prop.description).toBe('string');
      }
    }
  });
});
