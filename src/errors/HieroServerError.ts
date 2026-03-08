import { HieroError } from './HieroError.js';

/**
 * Thrown when the server returns an HTTP 5xx error.
 *
 * @public
 */
export class HieroServerError extends HieroError {
  constructor(message: string, options?: { statusCode?: number; rawBody?: string }) {
    super(message, { statusCode: options?.statusCode ?? 500, rawBody: options?.rawBody });
    this.name = 'HieroServerError';
  }
}
