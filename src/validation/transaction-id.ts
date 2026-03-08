import { HieroValidationError } from '../errors/HieroValidationError.js';

/**
 * Transaction ID format: `shard.realm.num-seconds-nanoseconds`
 * EC82/96: Force dash `-` delimiters (not `@` or `/`).
 */
const TRANSACTION_ID_PATTERN = /^\d+\.\d+\.\d+-\d+-\d+$/;

/**
 * Normalizes a transaction ID to canonical dash-delimited format.
 *
 * Accepts both dash and at-sign delimited formats:
 * - `"0.0.1234-1234567890-123456789"` → pass-through
 * - `"0.0.1234@1234567890.123456789"` → `"0.0.1234-1234567890-123456789"`
 *
 * @param txId - Transaction ID string
 * @returns Normalized transaction ID with dash delimiters
 * @throws {HieroValidationError} If format is invalid
 *
 * @public
 */
export function normalizeTransactionId(txId: string): string {
  // Already in canonical format
  if (TRANSACTION_ID_PATTERN.test(txId)) {
    return txId;
  }

  // Try converting from `@` + `.` format: "0.0.1234@seconds.nanos"
  const atMatch = /^(\d+\.\d+\.\d+)@(\d+)\.(\d+)$/.exec(txId);
  if (atMatch) {
    const [, account, seconds, nanos] = atMatch;
    return `${account}-${seconds}-${nanos}`;
  }

  throw new HieroValidationError(
    `Invalid transaction ID: "${txId}". Expected format: "0.0.X-seconds-nanos" or "0.0.X@seconds.nanos".`,
    { parameter: 'transactionId' },
  );
}
