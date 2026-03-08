import { describe, expect, it } from 'vitest';
import {
  arr,
  asRecord,
  bool,
  decodeBase64,
  decodeHexString,
  ensureString,
  num,
  str,
  strReq,
} from '../../../src/mappers/common.js';

describe('decodeBase64', () => {
  it('decodes a valid Base64 string to Uint8Array', () => {
    // "Hello" → SGVsbG8=
    const result = decodeBase64('SGVsbG8=');
    expect(result).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(result)).toBe('Hello');
  });

  it('decodes empty string to empty Uint8Array', () => {
    const result = decodeBase64('');
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
  });

  it('decodes binary content (not just text)', () => {
    // 0xFF 0xFE → //4=
    const result = decodeBase64('//4=');
    expect(result[0]).toBe(0xff);
    expect(result[1]).toBe(0xfe);
  });
});

describe('decodeHexString', () => {
  it('decodes a 0x-prefixed hex string to UTF-8', () => {
    // "WRONG_NONCE" = 0x57524f4e475f4e4f4e4345
    const result = decodeHexString('0x57524f4e475f4e4f4e4345');
    expect(result).toBe('WRONG_NONCE');
  });

  it('decodes without 0x prefix', () => {
    const result = decodeHexString('48656c6c6f');
    expect(result).toBe('Hello');
  });

  it('handles 0X uppercase prefix', () => {
    const result = decodeHexString('0X48656c6c6f');
    expect(result).toBe('Hello');
  });

  it('returns null for null input', () => {
    expect(decodeHexString(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(decodeHexString('')).toBeNull();
  });

  it('returns null for odd-length hex', () => {
    expect(decodeHexString('0x123')).toBeNull();
  });
});

describe('ensureString', () => {
  it('converts number to string (EC14/88)', () => {
    expect(ensureString(18)).toBe('18');
  });

  it('passes through string values', () => {
    expect(ensureString('42')).toBe('42');
  });

  it('returns "0" for null', () => {
    expect(ensureString(null)).toBe('0');
  });

  it('returns "0" for undefined', () => {
    expect(ensureString(undefined)).toBe('0');
  });
});

describe('asRecord', () => {
  it('passes through objects', () => {
    const obj = { a: 1 };
    expect(asRecord(obj)).toBe(obj);
  });

  it('returns empty object for null', () => {
    expect(asRecord(null)).toEqual({});
  });

  it('returns empty object for arrays', () => {
    expect(asRecord([1, 2])).toEqual({});
  });

  it('returns empty object for primitives', () => {
    expect(asRecord('hello')).toEqual({});
  });
});

describe('str', () => {
  it('extracts string field', () => {
    expect(str({ name: 'test' }, 'name')).toBe('test');
  });

  it('returns null for missing field', () => {
    expect(str({}, 'name')).toBeNull();
  });

  it('returns fallback for null value', () => {
    expect(str({ name: null }, 'name', 'default')).toBe('default');
  });

  it('converts number to string', () => {
    expect(str({ val: 42 }, 'val')).toBe('42');
  });
});

describe('strReq', () => {
  it('returns empty string for missing field', () => {
    expect(strReq({}, 'name')).toBe('');
  });
});

describe('num', () => {
  it('extracts number field', () => {
    expect(num({ count: 5 }, 'count')).toBe(5);
  });

  it('returns fallback for missing field', () => {
    expect(num({}, 'count', 99)).toBe(99);
  });

  it('converts string to number', () => {
    expect(num({ val: '42' }, 'val')).toBe(42);
  });
});

describe('bool', () => {
  it('extracts boolean field', () => {
    expect(bool({ active: true }, 'active')).toBe(true);
  });

  it('returns false for missing field', () => {
    expect(bool({}, 'active')).toBe(false);
  });
});

describe('arr', () => {
  it('extracts array field', () => {
    expect(arr({ items: [1, 2, 3] }, 'items')).toEqual([1, 2, 3]);
  });

  it('returns empty array for missing field', () => {
    expect(arr({}, 'items')).toEqual([]);
  });

  it('returns empty array for non-array values', () => {
    expect(arr({ items: 'not-array' }, 'items')).toEqual([]);
  });
});
