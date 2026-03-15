/**
 * HBAR / tinybar conversion utilities.
 *
 * The Hedera mirror node returns balances in **tinybars** (as strings for int64 safety).
 * 1 HBAR = 100,000,000 tinybars.
 *
 * These helpers eliminate the most common source of confusion when working
 * with Hedera balances.
 *
 * @packageDocumentation
 */

/** 1 HBAR = 100,000,000 tinybars. */
const TINYBARS_PER_HBAR = 100_000_000n;

/**
 * Converts tinybars (string) to HBAR (string) with up to 8 decimal places.
 *
 * ```ts
 * tinybarToHbar('100000000')  // '1'
 * tinybarToHbar('150000000')  // '1.5'
 * tinybarToHbar('1')          // '0.00000001'
 * tinybarToHbar('-250000000') // '-2.5'
 * ```
 */
export function tinybarToHbar(tinybars: string): string {
  const value = BigInt(tinybars);
  const negative = value < 0n;
  const abs = negative ? -value : value;

  const whole = abs / TINYBARS_PER_HBAR;
  const remainder = abs % TINYBARS_PER_HBAR;

  if (remainder === 0n) {
    return `${negative ? '-' : ''}${whole}`;
  }

  // Pad remainder to 8 digits then strip trailing zeros
  const fracStr = remainder.toString().padStart(8, '0').replace(/0+$/, '');
  return `${negative ? '-' : ''}${whole}.${fracStr}`;
}

/**
 * Converts HBAR (string or number) to tinybars (string).
 *
 * Accepts up to 8 decimal places.
 *
 * ```ts
 * hbarToTinybar('1')      // '100000000'
 * hbarToTinybar('1.5')    // '150000000'
 * hbarToTinybar('0.00000001') // '1'
 * hbarToTinybar('-2.5')   // '-250000000'
 * ```
 */
export function hbarToTinybar(hbar: string | number): string {
  const str = String(hbar);
  const negative = str.startsWith('-');
  const abs = negative ? str.slice(1) : str;

  const dotIndex = abs.indexOf('.');
  if (dotIndex === -1) {
    // Whole number
    const result = BigInt(abs) * TINYBARS_PER_HBAR;
    return `${negative ? '-' : ''}${result}`;
  }

  const wholePart = abs.slice(0, dotIndex) || '0';
  const fracPart = abs.slice(dotIndex + 1);

  if (fracPart.length > 8) {
    throw new RangeError(
      `HBAR value "${str}" exceeds maximum precision of 8 decimal places (tinybars)`,
    );
  }

  // Pad fractional part to exactly 8 digits
  const paddedFrac = fracPart.padEnd(8, '0');
  const wholeTinybars = BigInt(wholePart) * TINYBARS_PER_HBAR;
  const fracTinybars = BigInt(paddedFrac);
  const total = wholeTinybars + fracTinybars;

  return `${negative ? '-' : ''}${total}`;
}

/**
 * Formats a tinybar amount as a human-readable HBAR string with the symbol.
 *
 * ```ts
 * formatHbar('100000000')  // '1 HBAR'
 * formatHbar('150000000')  // '1.5 HBAR'
 * formatHbar('1')          // '0.00000001 HBAR'
 * formatHbar('-250000000') // '-2.5 HBAR'
 * ```
 */
export function formatHbar(tinybars: string): string {
  return `${tinybarToHbar(tinybars)} HBAR`;
}
