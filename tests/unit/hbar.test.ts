import { describe, expect, it } from 'vitest';
import { formatHbar, hbarToTinybar, tinybarToHbar } from '../../src/utils/hbar.js';

describe('tinybarToHbar', () => {
  it('converts 1 HBAR', () => {
    expect(tinybarToHbar('100000000')).toBe('1');
  });

  it('converts 0 tinybars', () => {
    expect(tinybarToHbar('0')).toBe('0');
  });

  it('converts fractional HBAR', () => {
    expect(tinybarToHbar('150000000')).toBe('1.5');
  });

  it('converts 1 tinybar', () => {
    expect(tinybarToHbar('1')).toBe('0.00000001');
  });

  it('handles large values', () => {
    expect(tinybarToHbar('5000000000000000000')).toBe('50000000000');
  });

  it('handles negative values', () => {
    expect(tinybarToHbar('-250000000')).toBe('-2.5');
  });

  it('strips trailing zeros in fractional part', () => {
    expect(tinybarToHbar('10000000')).toBe('0.1');
  });
});

describe('hbarToTinybar', () => {
  it('converts 1 HBAR', () => {
    expect(hbarToTinybar('1')).toBe('100000000');
  });

  it('converts 0 HBAR', () => {
    expect(hbarToTinybar('0')).toBe('0');
  });

  it('converts fractional HBAR', () => {
    expect(hbarToTinybar('1.5')).toBe('150000000');
  });

  it('converts smallest unit', () => {
    expect(hbarToTinybar('0.00000001')).toBe('1');
  });

  it('handles negative values', () => {
    expect(hbarToTinybar('-2.5')).toBe('-250000000');
  });

  it('accepts number input', () => {
    expect(hbarToTinybar(1.5)).toBe('150000000');
  });

  it('throws on too many decimal places', () => {
    expect(() => hbarToTinybar('1.000000001')).toThrow('exceeds maximum precision');
  });

  it('roundtrips with tinybarToHbar', () => {
    const original = '12345678';
    expect(hbarToTinybar(tinybarToHbar(original))).toBe(original);
  });
});

describe('formatHbar', () => {
  it('formats 1 HBAR', () => {
    expect(formatHbar('100000000')).toBe('1 HBAR');
  });

  it('formats fractional HBAR', () => {
    expect(formatHbar('150000000')).toBe('1.5 HBAR');
  });

  it('formats 1 tinybar', () => {
    expect(formatHbar('1')).toBe('0.00000001 HBAR');
  });

  it('formats negative value', () => {
    expect(formatHbar('-250000000')).toBe('-2.5 HBAR');
  });
});
