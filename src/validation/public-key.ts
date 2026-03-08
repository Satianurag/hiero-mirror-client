import { HieroValidationError } from '../errors/HieroValidationError.js';

/**
 * Public key: 64 hex chars (ED25519/ECDSA compressed) or 66 hex chars (ECDSA uncompressed).
 * No `0x` prefix expected.
 */
const PUBLIC_KEY_PATTERN = /^[0-9a-fA-F]{64}$|^[0-9a-fA-F]{66}$/;

/**
 * Validates a public key hex string.
 *
 * @param key - Public key hex string (64 or 66 chars)
 * @returns The validated key (pass-through)
 * @throws {HieroValidationError} If format is invalid
 *
 * @public
 */
export function validatePublicKey(key: string): string {
  if (!PUBLIC_KEY_PATTERN.test(key)) {
    throw new HieroValidationError(
      `Invalid public key: "${key}". Expected 64 or 66 hex characters without 0x prefix.`,
      { parameter: 'publicKey' },
    );
  }
  return key;
}
