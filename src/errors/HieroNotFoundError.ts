import { HieroError } from './HieroError.js';

/**
 * Thrown when the server returns HTTP 404 (Not Found) for a specific entity.
 *
 * @public
 */
export class HieroNotFoundError extends HieroError {
  /** The entity ID that was not found, if available. */
  readonly entityId?: string;

  constructor(message: string, options?: { entityId?: string; rawBody?: string }) {
    super(message, { statusCode: 404, rawBody: options?.rawBody });
    this.name = 'HieroNotFoundError';
    this.entityId = options?.entityId;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      entityId: this.entityId,
    };
  }
}
