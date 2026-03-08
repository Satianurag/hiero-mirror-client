import { HieroValidationError } from '../errors/HieroValidationError.js';

/**
 * Regex for entity IDs: plain number or shard.realm.num format.
 * No artificial digit limits — future shards may have larger numbers.
 *
 * Accepts: "800", "0.0.800", "0.0.98"
 * Rejects: "0.0.800.0", "abc", ""
 */
const ENTITY_ID_PATTERN = /^\d+(\.\d+\.\d+)?$/;

/**
 * Normalizes an entity ID to the canonical `shard.realm.num` format.
 *
 * - `800` or `"800"` → `"0.0.800"`
 * - `"0.0.800"` → `"0.0.800"` (pass-through)
 *
 * @param id - Entity ID as number or string
 * @returns Normalized entity ID string in `shard.realm.num` format
 * @throws {HieroValidationError} If the input is not a valid entity ID
 *
 * @public
 */
export function normalizeEntityId(id: string | number): string {
  const str = String(id);

  if (!ENTITY_ID_PATTERN.test(str)) {
    throw new HieroValidationError(
      `Invalid entity ID: "${str}". Expected format: "0.0.X" or a plain number.`,
      {
        parameter: 'entityId',
      },
    );
  }

  // Plain number → prepend "0.0."
  if (!str.includes('.')) {
    return `0.0.${str}`;
  }

  return str;
}

/**
 * Validates that a value is a valid entity ID without normalizing.
 *
 * @param id - Value to validate
 * @returns `true` if valid
 *
 * @internal
 */
export function isValidEntityId(id: string | number): boolean {
  return ENTITY_ID_PATTERN.test(String(id));
}
