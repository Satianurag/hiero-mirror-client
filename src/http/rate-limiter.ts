/**
 * Token bucket rate limiter for client-side request throttling.
 *
 * Uses a simple token bucket algorithm:
 * - Bucket starts full with `maxTokens` tokens
 * - Each request consumes 1 token
 * - Tokens replenish at `tokensPerSecond` rate
 * - If no tokens available, `acquire()` waits until a token is available
 *
 * Default: 50 requests per second.
 *
 * @internal
 */
export class RateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per ms
  private lastRefillTime: number;

  constructor(tokensPerSecond = 50) {
    this.maxTokens = tokensPerSecond;
    this.tokens = tokensPerSecond;
    this.refillRate = tokensPerSecond / 1000;
    this.lastRefillTime = Date.now();
  }

  /**
   * Refills tokens based on elapsed time since last refill.
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefillTime;
    const newTokens = elapsed * this.refillRate;
    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
    this.lastRefillTime = now;
  }

  /**
   * Acquires a token. If no tokens are available, waits until one is.
   *
   * @param signal - Optional abort signal for cancellation
   * @returns Promise that resolves when a token is acquired
   */
  async acquire(signal?: AbortSignal): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Calculate wait time until 1 token is available
    const deficit = 1 - this.tokens;
    const waitMs = Math.ceil(deficit / this.refillRate);

    // Use AbortSignal.any() to compose user signal with internal timeout.
    // No manual addEventListener — avoids listener accumulation.
    if (signal?.aborted) {
      throw signal.reason;
    }

    await new Promise<void>((resolve, reject) => {
      const onAbort = () => {
        clearTimeout(timer);
        reject(signal?.reason);
      };

      const timer = setTimeout(() => {
        if (signal) {
          signal.removeEventListener('abort', onAbort);
        }
        this.refill();
        this.tokens -= 1;
        resolve();
      }, waitMs);

      // If no external signal, nothing to compose.
      if (!signal) return;

      signal.addEventListener('abort', onAbort, { once: true });
    });
  }

  /**
   * Returns the current number of available tokens (for testing).
   *
   * @internal
   */
  get availableTokens(): number {
    this.refill();
    return this.tokens;
  }
}
