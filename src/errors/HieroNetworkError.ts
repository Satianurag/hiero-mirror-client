import { HieroError } from './HieroError.js';

/**
 * Thrown when a network-level error occurs: DNS resolution failure,
 * connection refused, socket hangup, etc.
 *
 * @public
 */
export class HieroNetworkError extends HieroError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = 'HieroNetworkError';
  }
}
