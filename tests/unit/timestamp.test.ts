import { describe, expect, it } from 'vitest';
import {
  compare,
  fromDate,
  fromParts,
  fromString,
  now,
  toDate,
} from '../../src/utils/timestamp.js';

describe('fromString', () => {
  it('parses full timestamp with nanoseconds', () => {
    const ts = fromString('1710000000.123456789');
    expect(ts.seconds).toBe(1710000000n);
    expect(ts.nanos).toBe(123456789);
  });

  it('parses timestamp without nanoseconds', () => {
    const ts = fromString('1710000000');
    expect(ts.seconds).toBe(1710000000n);
    expect(ts.nanos).toBe(0);
  });

  it('pads short nanosecond strings', () => {
    const ts = fromString('1710000000.1');
    expect(ts.nanos).toBe(100000000); // 0.1 seconds
  });

  it('truncates extra-long nanosecond strings', () => {
    const ts = fromString('1710000000.1234567890');
    expect(ts.nanos).toBe(123456789); // only first 9 digits
  });

  it('formats toString correctly', () => {
    const ts = fromString('1710000000.123456789');
    expect(ts.toString()).toBe('1710000000.123456789');
  });

  it('formats toString with zero nanos', () => {
    const ts = fromString('1710000000');
    expect(ts.toString()).toBe('1710000000.000000000');
  });
});

describe('fromDate', () => {
  it('converts a Date to ParsedTimestamp', () => {
    const date = new Date('2024-03-10T00:00:00.000Z');
    const ts = fromDate(date);
    expect(ts.seconds).toBe(BigInt(Math.floor(date.getTime() / 1000)));
    expect(ts.nanos).toBe(0);
  });

  it('preserves millisecond precision', () => {
    const date = new Date('2024-03-10T00:00:00.500Z');
    const ts = fromDate(date);
    expect(ts.nanos).toBe(500_000_000);
  });
});

describe('fromParts', () => {
  it('creates timestamp from seconds and nanos', () => {
    const ts = fromParts(1710000000n, 500000000);
    expect(ts.seconds).toBe(1710000000n);
    expect(ts.nanos).toBe(500000000);
  });

  it('throws on negative nanos', () => {
    expect(() => fromParts(0n, -1)).toThrow('nanoseconds');
  });

  it('throws on nanos > 999_999_999', () => {
    expect(() => fromParts(0n, 1_000_000_000)).toThrow('nanoseconds');
  });
});

describe('now', () => {
  it('returns a timestamp close to current time', () => {
    const before = Date.now();
    const ts = now();
    const after = Date.now();
    const tsMs = Number(ts.seconds) * 1000;
    expect(tsMs).toBeGreaterThanOrEqual(before - 1000);
    expect(tsMs).toBeLessThanOrEqual(after + 1000);
  });
});

describe('toDate', () => {
  it('converts ParsedTimestamp to Date', () => {
    const ts = fromString('1710000000.500000000');
    const date = toDate(ts);
    expect(date.getTime()).toBe(1710000000 * 1000 + 500);
  });

  it('roundtrips with fromDate', () => {
    const original = new Date('2024-06-15T12:30:45.123Z');
    const ts = fromDate(original);
    const restored = toDate(ts);
    expect(restored.getTime()).toBe(original.getTime());
  });
});

describe('compare', () => {
  it('returns 0 for equal timestamps', () => {
    const a = fromString('1710000000.123456789');
    const b = fromString('1710000000.123456789');
    expect(compare(a, b)).toBe(0);
  });

  it('returns -1 when first is earlier (seconds)', () => {
    const a = fromString('1710000000.000000000');
    const b = fromString('1710000001.000000000');
    expect(compare(a, b)).toBe(-1);
  });

  it('returns 1 when first is later (seconds)', () => {
    const a = fromString('1710000001.000000000');
    const b = fromString('1710000000.000000000');
    expect(compare(a, b)).toBe(1);
  });

  it('returns -1 when first is earlier (nanos)', () => {
    const a = fromString('1710000000.000000001');
    const b = fromString('1710000000.000000002');
    expect(compare(a, b)).toBe(-1);
  });

  it('returns 1 when first is later (nanos)', () => {
    const a = fromString('1710000000.999999999');
    const b = fromString('1710000000.000000000');
    expect(compare(a, b)).toBe(1);
  });
});
