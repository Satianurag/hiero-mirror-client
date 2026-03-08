import { HieroError } from './HieroError.js';

/**
 * Thrown when the server returns HTTP 400 or 415, or when client-side
 * input validation fails before the request is sent.
 *
 * @public
 */
export class HieroValidationError extends HieroError {
  /** The specific parameter that caused the validation error, if known. */
  readonly parameter?: string;

  constructor(
    message: string,
    options?: { statusCode?: number; parameter?: string; rawBody?: string },
  ) {
    super(message, { statusCode: options?.statusCode ?? 400, rawBody: options?.rawBody });
    this.name = 'HieroValidationError';
    this.parameter = options?.parameter;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      parameter: this.parameter,
    };
  }
}
