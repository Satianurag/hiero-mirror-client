import { describe, expect, it } from 'vitest';
import { _internals, safeJsonParse } from '../../src/http/json-parser.js';

// ---------------------------------------------------------------------------
// Safe integer preservation
// ---------------------------------------------------------------------------
describe('safeJsonParse — safe integers', () => {
  it('keeps small integers as numbers', () => {
    const result = safeJsonParse('{"value": 42}') as Record<string, unknown>;
    expect(result.value).toBe(42);
    expect(typeof result.value).toBe('number');
  });

  it('keeps zero as number', () => {
    const result = safeJsonParse('{"value": 0}') as Record<string, unknown>;
    expect(result.value).toBe(0);
  });

  it('keeps negative safe integers as numbers', () => {
    const result = safeJsonParse('{"value": -1000}') as Record<string, unknown>;
    expect(result.value).toBe(-1000);
  });

  it('keeps MAX_SAFE_INTEGER as number', () => {
    const result = safeJsonParse(`{"value": ${Number.MAX_SAFE_INTEGER}}`) as Record<
      string,
      unknown
    >;
    expect(result.value).toBe(Number.MAX_SAFE_INTEGER);
    expect(typeof result.value).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// Unsafe integer → string (CRITICAL: the whole point of this parser)
// ---------------------------------------------------------------------------
describe('safeJsonParse — unsafe integers → string', () => {
  // EC13: stake_rewarded on testnet
  it('converts stake_rewarded (1.8×10^17) to string', () => {
    const json = '{"stake_rewarded": 181118783800000000}';
    const result = safeJsonParse(json) as Record<string, unknown>;
    expect(result.stake_rewarded).toBe('181118783800000000');
    expect(typeof result.stake_rewarded).toBe('string');
  });

  // EC36: max_stake on testnet
  it('converts max_stake (4.5×10^16) to string', () => {
    const json = '{"max_stake": 45000000000000000}';
    const result = safeJsonParse(json) as Record<string, unknown>;
    expect(result.max_stake).toBe('45000000000000000');
    expect(typeof result.max_stake).toBe('string');
  });

  // EC1: balance near MAX_SAFE_INTEGER
  it('converts near-MAX_SAFE balance to string', () => {
    const json = '{"balance": 8813789810874846}';
    const result = safeJsonParse(json) as Record<string, unknown>;
    // 8813789810874846 < MAX_SAFE_INTEGER (9007199254740991), so it's actually safe
    expect(typeof result.balance).toBe('number');
  });

  // Just beyond MAX_SAFE_INTEGER
  it('converts MAX_SAFE_INTEGER + 1 to string', () => {
    const val = '9007199254740992'; // MAX_SAFE_INTEGER + 1
    const json = `{"value": ${val}}`;
    const result = safeJsonParse(json) as Record<string, unknown>;
    expect(result.value).toBe(val);
    expect(typeof result.value).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// Decimal preservation (EC36: node_reward_fee_fraction: 0.1)
// ---------------------------------------------------------------------------
describe('safeJsonParse — decimals stay as numbers', () => {
  it('keeps 0.1 as number (node_reward_fee_fraction)', () => {
    const json = '{"node_reward_fee_fraction": 0.1}';
    const result = safeJsonParse(json) as Record<string, unknown>;
    expect(result.node_reward_fee_fraction).toBe(0.1);
    expect(typeof result.node_reward_fee_fraction).toBe('number');
  });

  it('keeps 3.14 as number', () => {
    const result = safeJsonParse('{"pi": 3.14}') as Record<string, unknown>;
    expect(result.pi).toBe(3.14);
  });

  it('keeps 0.0 as number', () => {
    const result = safeJsonParse('{"zero": 0.0}') as Record<string, unknown>;
    expect(result.zero).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Mixed types in same object (EC12)
// ---------------------------------------------------------------------------
describe('safeJsonParse — mixed types in same object', () => {
  // Real testnet data: transaction has raw numbers AND strings
  it('handles mixed charged_tx_fee (number) and max_fee (string)', () => {
    const json = '{"charged_tx_fee": 1348742, "max_fee": "1000000000"}';
    const result = safeJsonParse(json) as Record<string, unknown>;
    expect(result.charged_tx_fee).toBe(1348742); // safe number
    expect(typeof result.charged_tx_fee).toBe('number');
    expect(result.max_fee).toBe('1000000000'); // already a string in JSON
    expect(typeof result.max_fee).toBe('string');
  });

  // EC36: stake has unsafe int AND decimal in same response
  it('handles unsafe int + decimal in same response', () => {
    const json = '{"stake_total": 1273210173400000000, "node_reward_fee_fraction": 0.1}';
    const result = safeJsonParse(json) as Record<string, unknown>;
    expect(result.stake_total).toBe('1273210173400000000'); // unsafe → string
    expect(result.node_reward_fee_fraction).toBe(0.1); // decimal → number
  });
});

// ---------------------------------------------------------------------------
// String values pass through unchanged
// ---------------------------------------------------------------------------
describe('safeJsonParse — strings and other types', () => {
  it('preserves string values', () => {
    const json = '{"total_supply": "5000000000000000000"}';
    const result = safeJsonParse(json) as Record<string, unknown>;
    expect(result.total_supply).toBe('5000000000000000000');
  });

  it('preserves null values', () => {
    const result = safeJsonParse('{"value": null}') as Record<string, unknown>;
    expect(result.value).toBeNull();
  });

  it('preserves boolean values', () => {
    const result = safeJsonParse('{"active": true}') as Record<string, unknown>;
    expect(result.active).toBe(true);
  });

  it('preserves arrays', () => {
    const result = safeJsonParse('{"items": [1, 2, 3]}') as Record<string, unknown>;
    expect(result.items).toEqual([1, 2, 3]);
  });

  it('preserves nested objects', () => {
    const json = '{"timestamp": {"from": "123", "to": null}}';
    const result = safeJsonParse(json) as Record<string, unknown>;
    expect(result.timestamp).toEqual({ from: '123', to: null });
  });
});

// ---------------------------------------------------------------------------
// Response size limit
// ---------------------------------------------------------------------------
describe('safeJsonParse — size limit', () => {
  it('rejects responses exceeding 10MB', () => {
    const text = 'x'.repeat(10 * 1024 * 1024 + 1);
    expect(() => safeJsonParse(text)).toThrow('exceeds maximum size');
  });
});

// ---------------------------------------------------------------------------
// Malformed JSON
// ---------------------------------------------------------------------------
describe('safeJsonParse — error handling', () => {
  it('throws SyntaxError for invalid JSON', () => {
    expect(() => safeJsonParse('{invalid')).toThrow();
  });

  it('throws SyntaxError for empty string', () => {
    expect(() => safeJsonParse('')).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Fallback path (lossless-json)
// ---------------------------------------------------------------------------
describe('safeJsonParseFallback', () => {
  const { safeJsonParseFallback } = _internals;

  it('converts unsafe integers to strings', () => {
    const json = '{"stake": 181118783800000000}';
    const result = safeJsonParseFallback(json) as Record<string, unknown>;
    expect(result.stake).toBe('181118783800000000');
  });

  it('keeps safe integers as numbers', () => {
    const json = '{"value": 42}';
    const result = safeJsonParseFallback(json) as Record<string, unknown>;
    expect(result.value).toBe(42);
  });

  it('keeps decimals as numbers', () => {
    const json = '{"fee": 0.1}';
    const result = safeJsonParseFallback(json) as Record<string, unknown>;
    expect(result.fee).toBe(0.1);
  });

  it('handles mixed types', () => {
    const json = '{"big": 1273210173400000000, "small": 100, "frac": 0.5, "str": "hello"}';
    const result = safeJsonParseFallback(json) as Record<string, unknown>;
    expect(result.big).toBe('1273210173400000000');
    expect(result.small).toBe(100);
    expect(result.frac).toBe(0.5);
    expect(result.str).toBe('hello');
  });
});
