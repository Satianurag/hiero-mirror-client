/**
 * Cross-platform encoding utilities.
 *
 * No dependency on Node.js `Buffer` — uses Web-standard APIs only.
 *
 * @packageDocumentation
 */

/**
 * Base64-to-hex conversion.
 *
 * ```ts
 * base64ToHex('SGVsbG8=') // → '48656c6c6f'
 * ```
 */
export function base64ToHex(base64: string): string {
  const bytes = base64ToBytes(base64);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hex-to-base64 conversion.
 *
 * Accepts optional 0x prefix.
 *
 * ```ts
 * hexToBase64('48656c6c6f')   // → 'SGVsbG8='
 * hexToBase64('0x48656c6c6f') // → 'SGVsbG8='
 * ```
 */
export function hexToBase64(hex: string): string {
  const cleaned = hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex;
  if (cleaned.length % 2 !== 0) {
    throw new Error(`Invalid hex string: odd length (${cleaned.length})`);
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = Number.parseInt(cleaned.slice(i, i + 2), 16);
  }
  return bytesToBase64(bytes);
}

/**
 * Convert a Uint8Array to a hex string (lowercase, no prefix).
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert a hex string (with optional 0x prefix) to Uint8Array.
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex;
  if (cleaned.length % 2 !== 0) {
    throw new Error(`Invalid hex string: odd length (${cleaned.length})`);
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = Number.parseInt(cleaned.slice(i, i + 2), 16);
  }
  return bytes;
}

// ---------------------------------------------------------------------------
// Internal helpers (no Buffer, cross-platform)
// ---------------------------------------------------------------------------

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64ToBytes(base64: string): Uint8Array {
  // Use atob if available (browser + Node 16+)
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // Manual fallback (should rarely be needed)
  const cleaned = base64.replace(/=+$/, '');
  const byteLength = (cleaned.length * 3) >> 2;
  const bytes = new Uint8Array(byteLength);
  let byteIndex = 0;

  for (let i = 0; i < cleaned.length; i += 4) {
    const a = BASE64_CHARS.indexOf(cleaned.charAt(i));
    const b = BASE64_CHARS.indexOf(cleaned.charAt(i + 1));
    const c = BASE64_CHARS.indexOf(i + 2 < cleaned.length ? cleaned.charAt(i + 2) : 'A');
    const d = BASE64_CHARS.indexOf(i + 3 < cleaned.length ? cleaned.charAt(i + 3) : 'A');

    bytes[byteIndex++] = (a << 2) | (b >> 4);
    if (i + 2 < cleaned.length) bytes[byteIndex++] = ((b & 15) << 4) | (c >> 2);
    if (i + 3 < cleaned.length) bytes[byteIndex++] = ((c & 3) << 6) | d;
  }

  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  // Use btoa if available (browser + Node 16+)
  if (typeof btoa === 'function') {
    let binary = '';
    for (const b of bytes) {
      binary += String.fromCharCode(b);
    }
    return btoa(binary);
  }

  // Manual fallback
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]!;
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;

    result += BASE64_CHARS[(a >> 2) & 63];
    result += BASE64_CHARS[((a & 3) << 4) | ((b >> 4) & 15)];
    result += i + 1 < bytes.length ? BASE64_CHARS[((b & 15) << 2) | ((c >> 6) & 3)] : '=';
    result += i + 2 < bytes.length ? BASE64_CHARS[c & 63] : '=';
  }

  return result;
}
