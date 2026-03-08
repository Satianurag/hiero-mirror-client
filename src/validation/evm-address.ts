import { HieroValidationError } from '../errors/HieroValidationError.js';

/**
 * EVM address: exactly 42 chars including `0x` prefix, or 40 hex chars without prefix.
 */
const EVM_ADDRESS_PATTERN = /^(0[xX])?[0-9a-fA-F]{40}$/;

/**
 * Validates and normalizes an EVM address.
 *
 * - Forces lowercase `0x` prefix (EC7/45/80/148)
 * - Auto-prepends `0x` if missing
 * - Body case is preserved (no checksum normalization)
 *
 * @param address - EVM address string
 * @returns Normalized address with lowercase `0x` prefix
 * @throws {HieroValidationError} If the input is not a valid EVM address
 *
 * @public
 */
export function validateEvmAddress(address: string): string {
  if (!EVM_ADDRESS_PATTERN.test(address)) {
    throw new HieroValidationError(
      `Invalid EVM address: "${address}". Expected 40 hex characters with optional 0x prefix.`,
      { parameter: 'evmAddress' },
    );
  }

  // Strip any existing prefix and re-add lowercase `0x`
  const body = address.startsWith('0x') || address.startsWith('0X') ? address.slice(2) : address;

  return `0x${body}`;
}
