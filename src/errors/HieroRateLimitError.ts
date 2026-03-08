import { HieroError } from './HieroError.js';

/**
 * Thrown when the server returns HTTP 429 (Too Many Requests).
 *
 * @public
 */
export class HieroRateLimitError extends HieroError {
  /** Seconds to wait before retrying, parsed from `Retry-After` header. */
  readonly retryAfter?: number;

  constructor(message: string, options?: { retryAfter?: number; rawBody?: string }) {
    super(message, { statusCode: 429, rawBody: options?.rawBody });
    this.name = 'HieroRateLimitError';
    this.retryAfter = options?.retryAfter;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}
