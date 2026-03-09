import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RETRY_OPTIONS,
  computeRetryDelay,
  isRetryableError,
  isRetryableStatus,
} from '../../src/http/retry.js';

describe('isRetryableStatus', () => {
  it('retries 429', () => expect(isRetryableStatus(429)).toBe(true));
  it('retries 500', () => expect(isRetryableStatus(500)).toBe(true));
  it('retries 502', () => expect(isRetryableStatus(502)).toBe(true));
  it('retries 503', () => expect(isRetryableStatus(503)).toBe(true));
  it('does not retry 400', () => expect(isRetryableStatus(400)).toBe(false));
  it('does not retry 401', () => expect(isRetryableStatus(401)).toBe(false));
  it('does not retry 404', () => expect(isRetryableStatus(404)).toBe(false));
  it('does not retry 415', () => expect(isRetryableStatus(415)).toBe(false));
});

describe('isRetryableError', () => {
  it('retries TypeError (fetch network failure)', () => {
    expect(isRetryableError(new TypeError('fetch failed'))).toBe(true);
  });

  it('does not retry AbortError (user cancellation)', () => {
    const err = new DOMException('Aborted', 'AbortError');
    expect(isRetryableError(err)).toBe(false);
  });

  it('does not retry generic Error', () => {
    expect(isRetryableError(new Error('random'))).toBe(false);
  });
});

describe('computeRetryDelay', () => {
  it('uses Retry-After when provided', () => {
    const delay = computeRetryDelay(0, DEFAULT_RETRY_OPTIONS, 30);
    expect(delay).toBe(30_000); // 30 seconds in ms
  });

  it('computes delay within bounds without Retry-After', () => {
    const delay = computeRetryDelay(0, DEFAULT_RETRY_OPTIONS);
    expect(delay).toBeGreaterThanOrEqual(0);
    expect(delay).toBeLessThanOrEqual(DEFAULT_RETRY_OPTIONS.baseDelay); // 500ms for attempt 0
  });

  it('increases delay exponentially', () => {
    // At attempt 2, max delay = min(10000, 500 * 4) = 2000
    const delays = Array.from({ length: 100 }, () => computeRetryDelay(2, DEFAULT_RETRY_OPTIONS));
    const maxSeen = Math.max(...delays);
    expect(maxSeen).toBeLessThanOrEqual(2000);
  });

  it('caps at maxDelay', () => {
    // At attempt 10, exponential would be huge, but capped at 10000
    const delays = Array.from({ length: 100 }, () => computeRetryDelay(10, DEFAULT_RETRY_OPTIONS));
    const maxSeen = Math.max(...delays);
    expect(maxSeen).toBeLessThanOrEqual(DEFAULT_RETRY_OPTIONS.maxDelay);
  });
});
