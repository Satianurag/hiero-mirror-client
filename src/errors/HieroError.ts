/**
 * Base error class for all Hiero Mirror Client errors.
 *
 * Modeled after Stripe's error hierarchy — every SDK error extends this class,
 * enabling `instanceof HieroError` to catch all SDK-specific errors.
 *
 * @public
 */
export class HieroError extends Error {
  /** HTTP status code, if the error originated from an HTTP response. */
  readonly statusCode?: number;

  /** The raw response body, if available. */
  readonly rawBody?: string;

  constructor(
    message: string,
    options?: { statusCode?: number; rawBody?: string; cause?: unknown },
  ) {
    super(message, { cause: options?.cause });
    this.name = 'HieroError';
    this.statusCode = options?.statusCode;
    this.rawBody = options?.rawBody;

    // Fix prototype chain for instanceof checks (TypeScript + ES5 target issue)
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}
