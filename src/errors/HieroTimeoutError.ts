import { HieroError } from './HieroError.js';

/**
 * Thrown when a request exceeds the configured timeout (AbortController).
 *
 * @public
 */
export class HieroTimeoutError extends HieroError {
  /** The timeout duration in milliseconds that was exceeded. */
  readonly timeoutMs: number;

  constructor(timeoutMs: number, options?: { cause?: unknown }) {
    super(`Request timed out after ${timeoutMs}ms`, { cause: options?.cause });
    this.name = 'HieroTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}
