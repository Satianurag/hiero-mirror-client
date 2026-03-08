import { describe, expect, it } from 'vitest';
import { base64ToHex, bytesToHex, hexToBase64, hexToBytes } from '../../src/utils/encoding.js';

describe('base64ToHex', () => {
  it('converts "Hello" base64 to hex', () => {
    expect(base64ToHex('SGVsbG8=')).toBe('48656c6c6f');
  });

  it('handles empty string', () => {
    expect(base64ToHex('')).toBe('');
  });

  it('converts binary data', () => {
    // 0xFF 0x00 → /wA=
    expect(base64ToHex('/wA=')).toBe('ff00');
  });

  it('handles data without padding', () => {
    // "AB" → QUI (no padding variant in some encoders)
    expect(base64ToHex('QUI=')).toBe('4142');
  });
});

describe('hexToBase64', () => {
  it('converts hex to base64', () => {
    expect(hexToBase64('48656c6c6f')).toBe('SGVsbG8=');
  });

  it('handles 0x prefix', () => {
    expect(hexToBase64('0x48656c6c6f')).toBe('SGVsbG8=');
  });

  it('handles 0X uppercase prefix', () => {
    expect(hexToBase64('0X48656c6c6f')).toBe('SGVsbG8=');
  });

  it('throws on odd-length hex', () => {
    expect(() => hexToBase64('123')).toThrow('odd length');
  });

  it('roundtrips with base64ToHex', () => {
    const original = 'SGVsbG8gV29ybGQ='; // "Hello World"
    expect(hexToBase64(base64ToHex(original))).toBe(original);
  });
});

describe('bytesToHex', () => {
  it('converts Uint8Array to lowercase hex', () => {
    expect(bytesToHex(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]))).toBe('48656c6c6f');
  });

  it('handles empty array', () => {
    expect(bytesToHex(new Uint8Array([]))).toBe('');
  });

  it('pads single-digit hex values', () => {
    expect(bytesToHex(new Uint8Array([0x00, 0x0f]))).toBe('000f');
  });
});

describe('hexToBytes', () => {
  it('converts hex to Uint8Array', () => {
    const result = hexToBytes('48656c6c6f');
    expect(result).toEqual(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
  });

  it('handles 0x prefix', () => {
    expect(hexToBytes('0xff00')).toEqual(new Uint8Array([0xff, 0x00]));
  });

  it('throws on odd-length hex', () => {
    expect(() => hexToBytes('abc')).toThrow('odd length');
  });

  it('roundtrips with bytesToHex', () => {
    const original = new Uint8Array([1, 2, 3, 255, 0]);
    expect(hexToBytes(bytesToHex(original))).toEqual(original);
  });
});
