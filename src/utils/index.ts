/**
 * Public utility functions for the Hiero Mirror Client SDK.
 *
 * These utilities can be imported independently without pulling in the full client:
 * ```ts
 * import { base64ToHex } from '@satianurag/hiero-mirror-client/utils';
 * ```
 *
 * @packageDocumentation
 */

// Encoding utilities
export { base64ToHex, bytesToHex, hexToBase64, hexToBytes } from './encoding.js';
// HBAR conversion utilities
export { formatHbar, hbarToTinybar, tinybarToHbar } from './hbar.js';
export type { ParsedTimestamp } from './timestamp.js';
// Timestamp utilities
export {
  compare,
  fromDate,
  fromParts,
  fromString,
  now,
  toDate,
} from './timestamp.js';
