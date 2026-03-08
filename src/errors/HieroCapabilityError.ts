import { HieroError } from './HieroError.js';

/**
 * Thrown when a known feature is disabled on the mirror node
 * (e.g., `/stateproof` returns 404 on valid transaction IDs — EC62).
 *
 * Distinct from {@link HieroNotFoundError} because the entity exists
 * but the feature is unavailable on this mirror node instance.
 *
 * @public
 */
export class HieroCapabilityError extends HieroError {
  /** The feature/endpoint that is disabled. */
  readonly feature: string;

  constructor(message: string, options: { feature: string; rawBody?: string }) {
    super(message, { statusCode: 404, rawBody: options.rawBody });
    this.name = 'HieroCapabilityError';
    this.feature = options.feature;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      feature: this.feature,
    };
  }
}
