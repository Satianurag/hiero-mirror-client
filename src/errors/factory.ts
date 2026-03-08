import { HieroError } from './HieroError.js';
import { HieroNotFoundError } from './HieroNotFoundError.js';
import { HieroParseError } from './HieroParseError.js';
import { HieroRateLimitError } from './HieroRateLimitError.js';
import { HieroServerError } from './HieroServerError.js';
import { HieroValidationError } from './HieroValidationError.js';

/**
 * Mirror Node error response shape:
 * `{ _status: { messages: [{ message: string, detail?: string, data?: unknown }] } }`
 */
interface MirrorNodeErrorBody {
  _status?: {
    messages?: Array<{
      message?: string;
      detail?: string;
      data?: unknown;
    }>;
  };
}

/**
 * Attempts to extract the error message from the Mirror Node's custom error shape.
 * Falls back to a generic message if parsing fails.
 *
 * @internal
 */
function extractErrorMessage(body: unknown): string {
  if (typeof body === 'object' && body !== null) {
    const mirrorBody = body as MirrorNodeErrorBody;
    const firstMessage = mirrorBody._status?.messages?.[0];
    if (firstMessage) {
      const parts = [firstMessage.message];
      if (firstMessage.detail) {
        parts.push(firstMessage.detail);
      }
      return parts.filter(Boolean).join(': ');
    }
  }
  return 'Unknown error';
}

/**
 * Attempts to extract a parameter name from Mirror Node error messages.
 * Messages like "Invalid parameter: limit" → returns "limit".
 *
 * @internal
 */
function extractParameter(message: string): string | undefined {
  const match = /Invalid parameter:\s*(.+)/i.exec(message);
  return match?.[1]?.trim();
}

/**
 * Creates the appropriate error subclass from an HTTP response.
 *
 * Maps HTTP status codes to error subclasses:
 * - 400 → `HieroValidationError`
 * - 404 → `HieroNotFoundError`
 * - 415 → `HieroValidationError` (wrong Content-Type, EC52)
 * - 429 → `HieroRateLimitError`
 * - 5xx → `HieroServerError`
 * - Other → `HieroError`
 *
 * @internal
 */
export function createErrorFromResponse(
  statusCode: number,
  body: unknown,
  rawBody: string,
  headers?: Headers,
): HieroError {
  const message = extractErrorMessage(body);

  switch (true) {
    case statusCode === 400:
    case statusCode === 415: {
      return new HieroValidationError(message, {
        statusCode,
        parameter: extractParameter(message),
        rawBody,
      });
    }

    case statusCode === 404: {
      return new HieroNotFoundError(message, { rawBody });
    }

    case statusCode === 429: {
      let retryAfter: number | undefined;
      const retryAfterHeader = headers?.get('retry-after');
      if (retryAfterHeader) {
        const parsed = Number.parseInt(retryAfterHeader, 10);
        if (!Number.isNaN(parsed)) {
          retryAfter = parsed;
        }
      }
      return new HieroRateLimitError(message, { retryAfter, rawBody });
    }

    case statusCode >= 500: {
      return new HieroServerError(message, { statusCode, rawBody });
    }

    default: {
      return new HieroError(message, { statusCode, rawBody });
    }
  }
}

/**
 * Creates an error from a non-JSON response body (e.g., HTML error pages from EC153).
 *
 * @internal
 */
export function createParseError(
  rawBody: string,
  statusCode?: number,
  cause?: unknown,
): HieroParseError {
  return new HieroParseError('Failed to parse response body as JSON', {
    body: rawBody,
    statusCode,
    cause,
  });
}
