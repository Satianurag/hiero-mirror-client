import { describe, expect, it } from 'vitest';
import { ETagCache } from '../../src/http/etag-cache.js';

describe('ETagCache', () => {
  it('returns undefined for unknown URLs', () => {
    const cache = new ETagCache();
    expect(cache.getETag('/api/v1/accounts')).toBeUndefined();
    expect(cache.getCachedBody('/api/v1/accounts')).toBeUndefined();
  });

  it('stores and retrieves ETag + body', () => {
    const cache = new ETagCache();
    const body = { accounts: [{ id: '0.0.1' }] };
    cache.set('/api/v1/accounts', 'W/"abc123"', body);

    expect(cache.getETag('/api/v1/accounts')).toBe('W/"abc123"');
    expect(cache.getCachedBody('/api/v1/accounts')).toBe(body);
  });

  it('updates existing entries', () => {
    const cache = new ETagCache();
    cache.set('/api/v1/accounts', 'W/"v1"', { v: 1 });
    cache.set('/api/v1/accounts', 'W/"v2"', { v: 2 });

    expect(cache.getETag('/api/v1/accounts')).toBe('W/"v2"');
    expect(cache.getCachedBody('/api/v1/accounts')).toEqual({ v: 2 });
  });

  it('normalizes URLs by removing trailing slashes (EC43)', () => {
    const cache = new ETagCache();
    cache.set('/api/v1/accounts/', 'W/"abc"', { data: 1 });

    expect(cache.getETag('/api/v1/accounts')).toBe('W/"abc"');
    expect(cache.getETag('/api/v1/accounts/')).toBe('W/"abc"');
  });

  it('deletes entries', () => {
    const cache = new ETagCache();
    cache.set('/api/v1/accounts', 'W/"abc"', {});
    expect(cache.size).toBe(1);

    cache.delete('/api/v1/accounts');
    expect(cache.size).toBe(0);
    expect(cache.getETag('/api/v1/accounts')).toBeUndefined();
  });

  it('clears all entries', () => {
    const cache = new ETagCache();
    cache.set('/url1', 'e1', {});
    cache.set('/url2', 'e2', {});
    expect(cache.size).toBe(2);

    cache.clear();
    expect(cache.size).toBe(0);
  });

  it('handles weak ETags (EC145 — all mirror node ETags are weak)', () => {
    const cache = new ETagCache();
    const weakETag = 'W/"1234567890abcdef"';
    cache.set('/api/v1/accounts', weakETag, { data: true });

    // The cache stores and retrieves weak ETags as-is
    expect(cache.getETag('/api/v1/accounts')).toBe(weakETag);
  });

  it('tracks size correctly', () => {
    const cache = new ETagCache();
    expect(cache.size).toBe(0);
    cache.set('/a', 'e1', {});
    expect(cache.size).toBe(1);
    cache.set('/b', 'e2', {});
    expect(cache.size).toBe(2);
    cache.delete('/a');
    expect(cache.size).toBe(1);
  });
});
