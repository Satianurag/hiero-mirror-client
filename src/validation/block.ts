import { HieroValidationError } from '../errors/HieroValidationError.js';

/**
 * Block hash: 64 or 96 hex chars (with optional 0x prefix).
 */
const BLOCK_HASH_PATTERN = /^(0x)?[0-9a-fA-F]{64}$|^(0x)?[0-9a-fA-F]{96}$/;

/**
 * Validates a block number.
 *
 * - Block 0 is valid (genesis block).
 * - Negative block numbers are invalid (EC54: returns 400).
 *
 * @param blockNumber - Block number to validate
 * @returns The validated block number
 * @throws {HieroValidationError} If negative or non-integer
 *
 * @public
 */
export function validateBlockNumber(blockNumber: number | string): number {
  const num = typeof blockNumber === 'string' ? Number.parseInt(blockNumber, 10) : blockNumber;

  if (Number.isNaN(num) || !Number.isInteger(num)) {
    throw new HieroValidationError(
      `Invalid block number: "${blockNumber}". Must be a non-negative integer.`,
      {
        parameter: 'blockNumber',
      },
    );
  }

  if (num < 0) {
    throw new HieroValidationError(`Invalid block number: ${num}. Must be >= 0 (EC54).`, {
      parameter: 'blockNumber',
    });
  }

  return num;
}

/**
 * Normalizes a block hash to lowercase with `0x` prefix (EC81/94).
 *
 * @param hash - Block hash hex string
 * @returns Normalized lowercase hash with `0x` prefix
 * @throws {HieroValidationError} If format is invalid
 *
 * @public
 */
export function normalizeBlockHash(hash: string): string {
  if (!BLOCK_HASH_PATTERN.test(hash)) {
    throw new HieroValidationError(
      `Invalid block hash: "${hash}". Expected 64 or 96 hex characters with optional 0x prefix.`,
      { parameter: 'blockHash' },
    );
  }

  const body = hash.startsWith('0x') || hash.startsWith('0X') ? hash.slice(2) : hash;
  return `0x${body.toLowerCase()}`;
}
