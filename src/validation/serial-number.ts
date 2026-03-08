import { HieroValidationError } from '../errors/HieroValidationError.js';

/**
 * Validates an NFT serial number.
 *
 * Serial numbers must be >= 1 (EC53: serial 0 returns 404).
 *
 * @param serial - Serial number to validate
 * @returns The validated serial number
 * @throws {HieroValidationError} If serial is 0 or negative
 *
 * @public
 */
export function validateSerialNumber(serial: number | string): number {
  const num = typeof serial === 'string' ? Number.parseInt(serial, 10) : serial;

  if (Number.isNaN(num) || !Number.isInteger(num)) {
    throw new HieroValidationError(
      `Invalid serial number: "${serial}". Must be a positive integer.`,
      {
        parameter: 'serialNumber',
      },
    );
  }

  if (num < 1) {
    throw new HieroValidationError(
      `Invalid serial number: ${num}. Must be >= 1 (EC53: serial 0 returns 404).`,
      {
        parameter: 'serialNumber',
      },
    );
  }

  return num;
}
