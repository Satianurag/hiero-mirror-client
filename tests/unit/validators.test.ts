import { describe, expect, it } from 'vitest';
import { HieroValidationError } from '../../src/errors/index.js';
import {
  HieroTimestamp,
  normalizeBlockHash,
  normalizeEntityId,
  normalizeTransactionId,
  validateBlockNumber,
  validateEvmAddress,
  validatePublicKey,
  validateSerialNumber,
} from '../../src/validation/index.js';

// ---------------------------------------------------------------------------
// Entity ID
// ---------------------------------------------------------------------------
describe('normalizeEntityId', () => {
  it('normalizes plain number to shard.realm.num', () => {
    expect(normalizeEntityId(800)).toBe('0.0.800');
  });

  it('normalizes string number to shard.realm.num', () => {
    expect(normalizeEntityId('800')).toBe('0.0.800');
  });

  it('passes through canonical format', () => {
    expect(normalizeEntityId('0.0.800')).toBe('0.0.800');
  });

  it('accepts large entity numbers (no digit limit)', () => {
    expect(normalizeEntityId('999999999')).toBe('0.0.999999999');
  });

  it('rejects four-part format', () => {
    expect(() => normalizeEntityId('0.0.800.0')).toThrow(HieroValidationError);
  });

  it('rejects alphabetic input', () => {
    expect(() => normalizeEntityId('abc')).toThrow(HieroValidationError);
  });

  it('rejects empty string', () => {
    expect(() => normalizeEntityId('')).toThrow(HieroValidationError);
  });
});

// ---------------------------------------------------------------------------
// EVM Address
// ---------------------------------------------------------------------------
describe('validateEvmAddress', () => {
  const validAddress = '0x00000000000000000000000000000000000003e8';

  it('passes valid lowercase address', () => {
    expect(validateEvmAddress(validAddress)).toBe(validAddress);
  });

  it('normalizes uppercase 0X prefix to lowercase 0x (EC7/45)', () => {
    expect(validateEvmAddress('0X00000000000000000000000000000000000003e8')).toBe(
      '0x00000000000000000000000000000000000003e8',
    );
  });

  it('auto-prepends 0x for unprefixed addresses', () => {
    expect(validateEvmAddress('00000000000000000000000000000000000003e8')).toBe(
      '0x00000000000000000000000000000000000003e8',
    );
  });

  it('rejects address with wrong length', () => {
    expect(() => validateEvmAddress('0x123')).toThrow(HieroValidationError);
  });

  it('rejects non-hex characters', () => {
    expect(() => validateEvmAddress('0xGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG')).toThrow(
      HieroValidationError,
    );
  });
});

// ---------------------------------------------------------------------------
// Timestamp
// ---------------------------------------------------------------------------
describe('HieroTimestamp', () => {
  it('creates from valid string', () => {
    const ts = HieroTimestamp.fromString('1234567890.123456789');
    expect(ts.toString()).toBe('1234567890.123456789');
  });

  it('rejects trailing dot (EC120)', () => {
    expect(() => HieroTimestamp.fromString('1234567890.')).toThrow(HieroValidationError);
  });

  it('rejects leading dot (EC121)', () => {
    expect(() => HieroTimestamp.fromString('.123456789')).toThrow(HieroValidationError);
  });

  it('rejects >9 nanos digits (EC87)', () => {
    expect(() => HieroTimestamp.fromString('1234567890.1234567890')).toThrow(HieroValidationError);
  });

  it('creates from Date', () => {
    const ts = HieroTimestamp.fromDate(new Date(1772900000000));
    expect(ts.toString()).toBe('1772900000.000000000');
  });

  it('creates from ms', () => {
    const ts = HieroTimestamp.fromMs(1772900000000);
    expect(ts.toString()).toBe('1772900000.000000000');
  });

  it('creates from ms with fractional seconds', () => {
    const ts = HieroTimestamp.fromMs(1772900000123);
    expect(ts.toString()).toBe('1772900000.123000000');
  });

  it('creates from seconds', () => {
    const ts = HieroTimestamp.fromSeconds(1772900000);
    expect(ts.toString()).toBe('1772900000.000000000');
  });

  it('rejects fractional seconds from fromSeconds', () => {
    expect(() => HieroTimestamp.fromSeconds(1.5)).toThrow(HieroValidationError);
  });

  it('creates from BigInt nanos', () => {
    const ts = HieroTimestamp.fromNanos(1772900000123000000n);
    expect(ts.toString()).toBe('1772900000.123000000');
  });

  it('rejects negative ms (EC30)', () => {
    expect(() => HieroTimestamp.fromMs(-1)).toThrow(HieroValidationError);
  });

  it('rejects negative seconds (EC30)', () => {
    expect(() => HieroTimestamp.fromSeconds(-1)).toThrow(HieroValidationError);
  });

  it('rejects negative BigInt nanos (EC30)', () => {
    expect(() => HieroTimestamp.fromNanos(-1n)).toThrow(HieroValidationError);
  });
});

// ---------------------------------------------------------------------------
// Transaction ID
// ---------------------------------------------------------------------------
describe('normalizeTransactionId', () => {
  it('passes through canonical dash format', () => {
    expect(normalizeTransactionId('0.0.1234-1234567890-123456789')).toBe(
      '0.0.1234-1234567890-123456789',
    );
  });

  it('converts @ format to dash format (EC82/96)', () => {
    expect(normalizeTransactionId('0.0.1234@1234567890.123456789')).toBe(
      '0.0.1234-1234567890-123456789',
    );
  });

  it('rejects invalid format', () => {
    expect(() => normalizeTransactionId('invalid')).toThrow(HieroValidationError);
  });

  it('rejects slash format', () => {
    expect(() => normalizeTransactionId('0.0.1234/1234567890/123456789')).toThrow(
      HieroValidationError,
    );
  });
});

// ---------------------------------------------------------------------------
// Public Key
// ---------------------------------------------------------------------------
describe('validatePublicKey', () => {
  it('accepts 64-char hex (ED25519)', () => {
    const key = 'a'.repeat(64);
    expect(validatePublicKey(key)).toBe(key);
  });

  it('accepts 66-char hex (ECDSA)', () => {
    const key = 'b'.repeat(66);
    expect(validatePublicKey(key)).toBe(key);
  });

  it('rejects 63-char hex', () => {
    expect(() => validatePublicKey('a'.repeat(63))).toThrow(HieroValidationError);
  });

  it('rejects hex with 0x prefix', () => {
    expect(() => validatePublicKey(`0x${'a'.repeat(64)}`)).toThrow(HieroValidationError);
  });
});

// ---------------------------------------------------------------------------
// Block
// ---------------------------------------------------------------------------
describe('validateBlockNumber', () => {
  it('accepts block 0 (genesis)', () => {
    expect(validateBlockNumber(0)).toBe(0);
  });

  it('accepts positive block number', () => {
    expect(validateBlockNumber(42)).toBe(42);
  });

  it('rejects negative block number (EC54)', () => {
    expect(() => validateBlockNumber(-1)).toThrow(HieroValidationError);
  });

  it('accepts string block number', () => {
    expect(validateBlockNumber('100')).toBe(100);
  });
});

describe('normalizeBlockHash', () => {
  it('normalizes hash to lowercase with 0x prefix (EC81/94)', () => {
    const hash = `0x${'A'.repeat(64)}`;
    expect(normalizeBlockHash(hash)).toBe(`0x${'a'.repeat(64)}`);
  });

  it('auto-prepends 0x for unprefixed hashes', () => {
    const hash = 'b'.repeat(64);
    expect(normalizeBlockHash(hash)).toBe(`0x${'b'.repeat(64)}`);
  });

  it('rejects wrong-length hashes', () => {
    expect(() => normalizeBlockHash('0x123')).toThrow(HieroValidationError);
  });
});

// ---------------------------------------------------------------------------
// Serial Number
// ---------------------------------------------------------------------------
describe('validateSerialNumber', () => {
  it('accepts serial 1', () => {
    expect(validateSerialNumber(1)).toBe(1);
  });

  it('rejects serial 0 (EC53)', () => {
    expect(() => validateSerialNumber(0)).toThrow(HieroValidationError);
  });

  it('rejects negative serial', () => {
    expect(() => validateSerialNumber(-1)).toThrow(HieroValidationError);
  });

  it('accepts string serial number', () => {
    expect(validateSerialNumber('5')).toBe(5);
  });
});
