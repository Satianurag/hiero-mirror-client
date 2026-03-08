import { describe, expect, it } from 'vitest';
import { RateLimiter } from '../../src/http/rate-limiter.js';

describe('RateLimiter', () => {
  it('allows immediate acquisition when tokens are available', async () => {
    const limiter = new RateLimiter(10);
    const start = Date.now();
    await limiter.acquire();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50); // Should be nearly instant
  });

  it('starts with full bucket', () => {
    const limiter = new RateLimiter(5);
    expect(limiter.availableTokens).toBeGreaterThanOrEqual(4); // ~5, allow floating point
  });

  it('depletes tokens on acquisition', async () => {
    const limiter = new RateLimiter(3);
    await limiter.acquire();
    await limiter.acquire();
    await limiter.acquire();
    // Should be at ~0 tokens now (might have refilled slightly)
    expect(limiter.availableTokens).toBeLessThan(1);
  });

  it('throttles when bucket is empty', async () => {
    const limiter = new RateLimiter(2);
    // Drain the bucket
    await limiter.acquire();
    await limiter.acquire();

    // Next acquire should take some time to refill
    const start = Date.now();
    await limiter.acquire();
    const elapsed = Date.now() - start;
    // Should wait roughly 500ms (1/2 tokens per second = 500ms per token)
    expect(elapsed).toBeGreaterThan(100);
  });

  it('supports abort signal cancellation', async () => {
    const limiter = new RateLimiter(1);
    await limiter.acquire(); // Drain

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 50);

    await expect(limiter.acquire(controller.signal)).rejects.toThrow();
  });
});
