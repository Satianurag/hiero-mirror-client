/**
 * Exponential backoff with jitter for retrying failed requests.
 *
 * Retry rules:
 * - Always retry: 5xx, network errors, 429
 * - Never retry: 400, 401, 403, 404 (client errors are not transient)
 * - 429: Always retry, use `Retry-After` header if present
 *
 * @internal
 */

export interface RetryOptions {
  /** Maximum number of retries. Default: 2. */
  maxRetries: number;
  /** Base delay in milliseconds. Default: 500ms. */
  baseDelay: number;
  /** Maximum delay cap in milliseconds. Default: 10000ms. */
  maxDelay: number;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 2,
  baseDelay: 500,
  maxDelay: 10_000,
};

/**
 * Determines whether a given HTTP status code is retryable.
 *
 * - 429 (Too Many Requests): always retryable
 * - 5xx (Server Error): retryable
 * - 4xx (Client Error): not retryable (except 429)
 *
 * @internal
 */
export function isRetryableStatus(statusCode: number): boolean {
  if (statusCode === 429) return true;
  if (statusCode >= 500) return true;
  return false;
}

/**
 * Determines whether an error is a retryable network error.
 *
 * @internal
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof TypeError) {
    // fetch throws TypeError on network failures
    return true;
  }
  // AbortError (user cancellation) and TimeoutError are NOT retryable
  if (
    error instanceof DOMException &&
    (error.name === 'AbortError' || error.name === 'TimeoutError')
  ) {
    return false;
  }
  return false;
}

/**
 * Computes the delay before the next retry attempt using exponential backoff
 * with full jitter.
 *
 * Formula: `random(0, min(maxDelay, baseDelay * 2^attempt))`
 *
 * @param attempt - Zero-based attempt number (0 = first retry)
 * @param options - Retry configuration
 * @param retryAfter - Optional `Retry-After` value from 429 response (seconds)
 * @returns Delay in milliseconds
 *
 * @internal
 */
export function computeRetryDelay(
  attempt: number,
  options: RetryOptions,
  retryAfter?: number,
): number {
  // If server provides Retry-After, use it (converted to ms)
  if (retryAfter !== undefined && retryAfter > 0) {
    return retryAfter * 1000;
  }

  const exponentialDelay = options.baseDelay * 2 ** attempt;
  const cappedDelay = Math.min(exponentialDelay, options.maxDelay);

  // Full jitter: uniform random in [0, cappedDelay]
  return Math.random() * cappedDelay;
}

/**
 * Sleeps for the specified number of milliseconds.
 * Returns a promise that resolves after the delay, respecting abort signals.
 *
 * @internal
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    const timer = setTimeout(() => {
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
