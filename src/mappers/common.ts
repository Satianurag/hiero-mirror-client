/**
 * Shared mapper utilities for transforming raw API JSON → SDK types.
 *
 * @internal
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// Base64 decode — cross-platform (no Buffer dependency, EC3/11/18)
// ---------------------------------------------------------------------------

/**
 * Decodes a Base64 string to a `Uint8Array`.
 *
 * Uses `atob()` which is available in all modern environments
 * (browsers, Node 16+, Deno, Bun).
 */
export function decodeBase64(value: string): Uint8Array {
  const binaryString = atob(value);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// ---------------------------------------------------------------------------
// Hex string decode — UTF-8 (EC24)
// ---------------------------------------------------------------------------

/**
 * Decodes a hex-encoded string (e.g., `0x57524f4e475f4e4f4e4345`) to UTF-8.
 *
 * EC24: Contract `error_message` fields are hex-encoded.
 *
 * @returns The decoded string, or `null` if the input is not valid hex.
 */
export function decodeHexString(hex: string | null): string | null {
  if (hex == null || hex === '') return null;

  // Strip `0x` prefix if present
  const raw = hex.startsWith('0x') || hex.startsWith('0X') ? hex.slice(2) : hex;

  if (raw.length === 0 || raw.length % 2 !== 0) return null;

  try {
    const bytes: number[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      bytes.push(Number.parseInt(raw.substring(i, i + 2), 16));
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Type coercion — ensure string (EC14/88)
// ---------------------------------------------------------------------------

/**
 * Coerces a value to a string representation.
 *
 * EC14/88: `decimals` is sometimes returned as a number (list endpoints)
 * and sometimes as a string (detail endpoints). We normalize to string.
 */
export function ensureString(value: unknown): string {
  if (value == null) return '0';
  return String(value);
}

// ---------------------------------------------------------------------------
// Record helper — type-safe access
// ---------------------------------------------------------------------------

/**
 * Casts unknown to a record for field extraction.
 *
 * @internal
 */
export function asRecord(value: unknown): Record<string, unknown> {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

/**
 * Extracts a string field with optional fallback.
 */
export function str(
  raw: Record<string, unknown>,
  key: string,
  fallback: string | null = null,
): string | null {
  const v = raw[key];
  if (v == null) return fallback;
  return String(v);
}

/**
 * Extracts a required string field (returns empty string if missing).
 */
export function strReq(raw: Record<string, unknown>, key: string): string {
  return str(raw, key, '') as string;
}

/**
 * Extracts a number field with optional fallback.
 */
export function num(raw: Record<string, unknown>, key: string, fallback = 0): number {
  const v = raw[key];
  if (v == null) return fallback;
  return typeof v === 'number' ? v : Number(v);
}

/**
 * Extracts a boolean field.
 */
export function bool(raw: Record<string, unknown>, key: string, fallback = false): boolean {
  const v = raw[key];
  if (v == null) return fallback;
  return Boolean(v);
}

/**
 * Extracts an array field.
 */
export function arr<T = unknown>(raw: Record<string, unknown>, key: string): T[] {
  const v = raw[key];
  return Array.isArray(v) ? (v as T[]) : [];
}
