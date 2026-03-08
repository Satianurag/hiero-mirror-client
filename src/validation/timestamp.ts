import { HieroValidationError } from '../errors/HieroValidationError.js';

/**
 * Timestamp format: `seconds.nanoseconds`
 * - Seconds: positive integer
 * - Nanoseconds: 1-9 digits (EC87: max 9 nanos, EC120: no trailing dots, EC121: no leading dots)
 */
const TIMESTAMP_PATTERN = /^\d+\.\d{1,9}$/;

/**
 * Represents a Hiero-format timestamp (`seconds.nanoseconds`).
 *
 * Provides conversions from common JavaScript types to the API format.
 *
 * @public
 */
export class HieroTimestamp {
  /** The raw timestamp string in `seconds.nanoseconds` format. */
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  /**
   * Creates a timestamp from a raw `seconds.nanoseconds` string.
   *
   * @param raw - Timestamp string (e.g., `"1234567890.123456789"`)
   * @throws {HieroValidationError} For invalid formats
   */
  static fromString(raw: string): HieroTimestamp {
    if (!TIMESTAMP_PATTERN.test(raw)) {
      throw new HieroValidationError(
        `Invalid timestamp: "${raw}". Expected format: "seconds.nanoseconds" (1-9 nanosecond digits, no trailing/leading dots).`,
        { parameter: 'timestamp' },
      );
    }
    return new HieroTimestamp(raw);
  }

  /**
   * Creates a timestamp from a JavaScript `Date`.
   *
   * @param date - Date object
   * @returns Timestamp with millisecond precision (6 trailing zeros for nanoseconds)
   */
  static fromDate(date: Date): HieroTimestamp {
    const ms = date.getTime();
    if (ms < 0) {
      throw new HieroValidationError('Negative timestamps are not supported (EC30).', {
        parameter: 'timestamp',
      });
    }
    const seconds = Math.floor(ms / 1000);
    const nanos = (ms % 1000) * 1_000_000;
    return new HieroTimestamp(`${seconds}.${String(nanos).padStart(9, '0')}`);
  }

  /**
   * Creates a timestamp from milliseconds since epoch.
   *
   * @param ms - Milliseconds since Unix epoch
   */
  static fromMs(ms: number): HieroTimestamp {
    if (ms < 0) {
      throw new HieroValidationError('Negative timestamps are not supported (EC30).', {
        parameter: 'timestamp',
      });
    }
    const seconds = Math.floor(ms / 1000);
    const nanos = (ms % 1000) * 1_000_000;
    return new HieroTimestamp(`${seconds}.${String(nanos).padStart(9, '0')}`);
  }

  /**
   * Creates a timestamp from seconds since epoch (integer seconds only).
   *
   * @param seconds - Seconds since Unix epoch
   */
  static fromSeconds(seconds: number): HieroTimestamp {
    if (seconds < 0) {
      throw new HieroValidationError('Negative timestamps are not supported (EC30).', {
        parameter: 'timestamp',
      });
    }
    if (!Number.isInteger(seconds)) {
      throw new HieroValidationError(
        'Use fromMs() for sub-second precision, or fromString() for nanosecond precision.',
        { parameter: 'timestamp' },
      );
    }
    return new HieroTimestamp(`${seconds}.000000000`);
  }

  /**
   * Creates a timestamp from nanoseconds since epoch (as BigInt).
   *
   * @param nanos - Nanoseconds since Unix epoch
   */
  static fromNanos(nanos: bigint): HieroTimestamp {
    if (nanos < 0n) {
      throw new HieroValidationError('Negative timestamps are not supported (EC30).', {
        parameter: 'timestamp',
      });
    }
    const seconds = nanos / 1_000_000_000n;
    const remainder = nanos % 1_000_000_000n;
    return new HieroTimestamp(`${seconds}.${String(remainder).padStart(9, '0')}`);
  }
}

/**
 * Validates a raw timestamp string without creating a `HieroTimestamp` object.
 *
 * @param raw - Timestamp string to validate
 * @returns `true` if the format is valid
 *
 * @internal
 */
export function isValidTimestamp(raw: string): boolean {
  return TIMESTAMP_PATTERN.test(raw);
}
