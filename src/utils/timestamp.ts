/**
 * HieroTimestamp — factory methods for Hedera/Hiero timestamps.
 *
 * Hedera timestamps use the format `seconds.nanoseconds`, e.g., `1710000000.123456789`.
 *
 * @packageDocumentation
 */

/**
 * Represents a Hedera consensus timestamp as `seconds.nanoseconds`.
 */
export interface HieroTimestamp {
  /** Whole seconds since epoch. */
  readonly seconds: bigint;
  /** Nanosecond component (0–999,999,999). */
  readonly nanos: number;
  /** Full timestamp string: `<seconds>.<nanos padded to 9 digits>`. */
  toString(): string;
}

/**
 * Creates a HieroTimestamp from a `seconds.nanos` string.
 *
 * ```ts
 * const ts = fromString('1710000000.123456789');
 * ts.seconds // 1710000000n
 * ts.nanos   // 123456789
 * ts.toString() // '1710000000.123456789'
 * ```
 */
export function fromString(timestamp: string): HieroTimestamp {
  const dotIndex = timestamp.indexOf('.');
  if (dotIndex === -1) {
    const seconds = BigInt(timestamp);
    return makeTimestamp(seconds, 0);
  }

  const seconds = BigInt(timestamp.slice(0, dotIndex));
  const nanosStr = timestamp
    .slice(dotIndex + 1)
    .padEnd(9, '0')
    .slice(0, 9);
  const nanos = Number.parseInt(nanosStr, 10);

  return makeTimestamp(seconds, nanos);
}

/**
 * Creates a HieroTimestamp from a JavaScript `Date`.
 *
 * Note: JS Date only has millisecond precision. Nanoseconds below ms will be 0.
 *
 * ```ts
 * const ts = fromDate(new Date('2024-03-10T00:00:00Z'));
 * ```
 */
export function fromDate(date: Date): HieroTimestamp {
  const epochMs = date.getTime();
  const seconds = BigInt(Math.floor(epochMs / 1000));
  const nanos = (epochMs % 1000) * 1_000_000;
  return makeTimestamp(seconds, nanos);
}

/**
 * Creates a HieroTimestamp for the current moment.
 *
 * ```ts
 * const ts = now();
 * ```
 */
export function now(): HieroTimestamp {
  return fromDate(new Date());
}

/**
 * Creates a HieroTimestamp from separate seconds and nanoseconds.
 *
 * ```ts
 * const ts = fromParts(1710000000n, 123456789);
 * ```
 */
export function fromParts(seconds: bigint, nanos: number): HieroTimestamp {
  if (nanos < 0 || nanos > 999_999_999) {
    throw new RangeError(`nanoseconds must be 0..999_999_999, got ${nanos}`);
  }
  return makeTimestamp(seconds, nanos);
}

/**
 * Converts a HieroTimestamp to a JavaScript Date.
 *
 * Note: sub-millisecond precision is lost.
 */
export function toDate(timestamp: HieroTimestamp): Date {
  const ms = Number(timestamp.seconds) * 1000 + Math.floor(timestamp.nanos / 1_000_000);
  return new Date(ms);
}

/**
 * Compares two timestamps. Returns -1, 0, or 1.
 */
export function compare(a: HieroTimestamp, b: HieroTimestamp): -1 | 0 | 1 {
  if (a.seconds < b.seconds) return -1;
  if (a.seconds > b.seconds) return 1;
  if (a.nanos < b.nanos) return -1;
  if (a.nanos > b.nanos) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function makeTimestamp(seconds: bigint, nanos: number): HieroTimestamp {
  return {
    seconds,
    nanos,
    toString() {
      return `${seconds}.${String(nanos).padStart(9, '0')}`;
    },
  };
}
