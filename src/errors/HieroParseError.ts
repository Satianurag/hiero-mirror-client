import { HieroError } from './HieroError.js';

/**
 * Thrown when the response body cannot be parsed as JSON,
 * or when the response Content-Type is unexpected (e.g., `text/html`
 * for Unicode parameter errors — EC153).
 *
 * @public
 */
export class HieroParseError extends HieroError {
  /** The raw body text that could not be parsed. */
  readonly body: string;

  constructor(message: string, options: { body: string; statusCode?: number; cause?: unknown }) {
    super(message, { statusCode: options.statusCode, rawBody: options.body, cause: options.cause });
    this.name = 'HieroParseError';
    this.body = options.body;
  }
}
