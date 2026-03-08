/**
 * Safe JSON parser that prevents int64 precision loss.
 *
 * **Primary:** TC39 Stage 4 `context.source` reviver (Node 22+, modern browsers as of March 2026).
 * **Fallback:** `lossless-json` library (4KB, for Node 18-20 without `context.source`).
 *
 * Numbers exceeding `Number.MAX_SAFE_INTEGER` are returned as strings.
 * Decimals (e.g., `0.1`) remain as numbers.
 *
 * @internal
 */

import { parse as losslessParse } from 'lossless-json';

/** Maximum response body size (10MB) before parsing is rejected. */
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;

/**
 * Feature-detect `context.source` support (TC39 Stage 4, Nov 2025).
 * Evaluated once at module load time.
 */
const HAS_CONTEXT_SOURCE: boolean = (() => {
  try {
    let seen = false;
    JSON.parse('1', (_key: string, _value: unknown, context?: { source?: string }) => {
      if (context?.source !== undefined) {
        seen = true;
      }
    });
    return seen;
  } catch {
    return false;
  }
})();

/**
 * Reviver function for `JSON.parse` that uses TC39 `context.source` to detect
 * unsafe integers and return them as strings.
 *
 * Rules:
 * - Integers exceeding MAX_SAFE_INTEGER → return raw source string
 * - Safe integers → return as number
 * - Decimals (non-integer numbers like 0.1) → return as number
 * - All other types → pass through unchanged
 */
function safeReviver(_key: string, value: unknown, context?: { source?: string }): unknown {
  if (typeof value === 'number' && context?.source !== undefined) {
    // Check if this is an integer (no decimal point in the raw source)
    const source = context.source;
    const isInteger = !source.includes('.') && !source.includes('e') && !source.includes('E');

    if (isInteger && !Number.isSafeInteger(value)) {
      return source; // Return raw source string to prevent precision loss
    }
  }
  return value;
}

/**
 * Fallback parser using `lossless-json` for environments without `context.source`.
 *
 * The lossless-json library parses all numbers as `LosslessNumber` objects,
 * then the reviver converts them back to `number` (if safe) or `string` (if unsafe).
 */
function safeJsonParseFallback(text: string): unknown {
  return losslessParse(text, undefined, (value: string) => {
    const num = Number(value);

    // If it's NaN, keep as string
    if (Number.isNaN(num)) {
      return value;
    }

    // Decimals: keep as number (e.g., 0.1, 3.14)
    const isInteger = !value.includes('.') && !value.includes('e') && !value.includes('E');
    if (!isInteger) {
      return num;
    }

    // Safe integer: keep as number
    if (Number.isSafeInteger(num)) {
      return num;
    }

    // Unsafe integer: return as string
    return value;
  });
}

/**
 * Parses a JSON string safely, preserving precision for large integers.
 *
 * Numbers exceeding `Number.MAX_SAFE_INTEGER` are returned as strings.
 * Decimals remain as JavaScript `number` values.
 *
 * @param text - The raw JSON string to parse
 * @returns The parsed value
 * @throws {Error} If the input exceeds the maximum response size
 * @throws {SyntaxError} If the input is not valid JSON
 *
 * @internal
 */
export function safeJsonParse(text: string): unknown {
  if (text.length > MAX_RESPONSE_SIZE) {
    throw new Error(
      `Response body exceeds maximum size of ${MAX_RESPONSE_SIZE} bytes (${text.length} bytes received)`,
    );
  }

  if (HAS_CONTEXT_SOURCE) {
    return JSON.parse(text, safeReviver as Parameters<typeof JSON.parse>[1]);
  }

  return safeJsonParseFallback(text);
}

/**
 * Whether the current runtime supports TC39 `context.source` (primary path)
 * or uses the lossless-json fallback.
 *
 * Exposed for testing purposes.
 * @internal
 */
export const _internals = {
  HAS_CONTEXT_SOURCE,
  safeJsonParseFallback,
} as const;
