import { HieroValidationError } from '../errors/HieroValidationError.js';

/** Maximum URL length before rejection (EC34). */
const MAX_URL_LENGTH = 4096;

/**
 * Operator types supported by the Mirror Node API query parameters.
 * Used with `.append()` for multi-value/range queries: `timestamp=gt:1234`.
 */
export type QueryOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte';

/**
 * A query parameter value with an optional operator prefix.
 */
export interface OperatorValue {
  operator: QueryOperator;
  value: string | number;
}

/**
 * Raw query parameter types accepted by the URL builder.
 */
export type QueryParamValue =
  | string
  | number
  | boolean
  | OperatorValue
  | OperatorValue[]
  | undefined
  | null;

export interface QueryParams {
  [key: string]: QueryParamValue;
}

/**
 * Mapping of SDK-friendly camelCase parameter names to the dot-notation
 * parameter names expected by the Mirror Node API (EC64).
 */
const PARAM_NAME_MAP: Record<string, string> = {
  senderId: 'sender.id',
  receiverId: 'receiver.id',
  accountId: 'account.id',
  tokenId: 'token.id',
  nodeId: 'node.id',
  scheduleId: 'schedule.id',
  nonce: 'nonce',
};

/**
 * Resolves a parameter name through the camelCase→dot.notation map.
 */
function resolveParamName(name: string): string {
  return PARAM_NAME_MAP[name] ?? name;
}

/**
 * Builds a complete URL from base URL, path segments, and query parameters.
 *
 * Handles:
 * - Double-slash collapsing (EC115)
 * - Null byte stripping (EC154)
 * - Trailing slash removal (EC43)
 * - Operator query params: `timestamp=gt:1234` (EC10)
 * - Scalar query params: `limit=10` (EC42)
 * - CamelCase→dot.notation parameter name mapping (EC64)
 * - URL length validation (<4KB, EC34)
 * - Omission of undefined/null/"" param values (EC119)
 *
 * @param baseUrl - The base URL (e.g., `https://testnet.mirrornode.hedera.com`)
 * @param path - The API path (e.g., `/api/v1/accounts`)
 * @param params - Optional query parameters
 * @returns The fully constructed URL string
 * @throws {HieroValidationError} If the resulting URL exceeds the max length
 *
 * @internal
 */
export function buildUrl(baseUrl: string, path: string, params?: QueryParams): string {
  // Strip null bytes (EC154)
  let cleanPath = path.replace(/\0/g, '');

  // Collapse double slashes (EC115) — preserve protocol ://
  cleanPath = cleanPath.replace(/(?<!:)\/{2,}/g, '/');

  // Strip trailing slash (EC43)
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  // Build the URL
  const url = new URL(cleanPath, baseUrl);

  // Add query parameters
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      // Skip undefined, null, and empty string values (EC119)
      if (value === undefined || value === null || value === '') {
        continue;
      }

      const resolvedKey = resolveParamName(key);

      if (typeof value === 'object' && 'operator' in value) {
        // Single operator value: timestamp=gt:1234
        url.searchParams.append(resolvedKey, `${value.operator}:${value.value}`);
      } else if (Array.isArray(value)) {
        // Array of operator values: multiple operator params
        for (const item of value) {
          if (typeof item === 'object' && 'operator' in item) {
            url.searchParams.append(resolvedKey, `${item.operator}:${item.value}`);
          }
        }
      } else {
        // Scalar value: limit=10 (uses set to enforce last-wins, EC42)
        url.searchParams.set(resolvedKey, String(value));
      }
    }
  }

  const result = url.toString();

  // URL length check (EC34)
  if (result.length > MAX_URL_LENGTH) {
    throw new HieroValidationError(
      `URL exceeds maximum length of ${MAX_URL_LENGTH} characters (${result.length} chars).`,
      { parameter: 'url' },
    );
  }

  return result;
}
