/**
 * In-memory ETag cache with LRU eviction and TTL expiry.
 *
 * - Stores `{etag, body, expiry}` per normalized URL
 * - Sends `If-None-Match` on subsequent requests
 * - Returns cached body on 304 Not Modified
 * - Updates on 200 OK
 * - LRU eviction when `maxEntries` is reached
 * - TTL-based expiry (entries older than `ttlMs` are stale)
 *
 * EC145: All Mirror Node ETags are weak (W/"...").
 *
 * @internal
 * @packageDocumentation
 */

export interface ETagCacheOptions {
  /** Maximum number of entries. Default: 500. */
  maxEntries?: number;
  /** Time-to-live in milliseconds. Default: 300_000 (5 minutes). */
  ttlMs?: number;
}

interface ETagEntry {
  etag: string;
  body: unknown;
  /** Timestamp (ms) when this entry expires. */
  expiry: number;
}

/**
 * LRU ETag cache with TTL expiry.
 *
 * Keys are normalized URLs (no trailing slashes).
 * Uses Map insertion order for LRU: newest entries are re-inserted at the end.
 */
export class ETagCache {
  private readonly store = new Map<string, ETagEntry>();
  private readonly maxEntries: number;
  private readonly ttlMs: number;

  constructor(options: ETagCacheOptions = {}) {
    this.maxEntries = options.maxEntries ?? 500;
    this.ttlMs = options.ttlMs ?? 300_000; // 5 minutes
  }

  /**
   * Look up a cached ETag for the given URL.
   *
   * @returns The cached ETag string, or `undefined` if not cached or expired.
   */
  getETag(url: string): string | undefined {
    const key = this.normalizeKey(url);
    const entry = this.store.get(key);
    if (!entry) return undefined;

    // Check TTL
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return undefined;
    }

    // LRU: move to end (most recently used)
    this.store.delete(key);
    this.store.set(key, entry);

    return entry.etag;
  }

  /**
   * Look up the cached response body for the given URL.
   *
   * @returns The cached body, or `undefined` if not cached or expired.
   */
  getCachedBody(url: string): unknown | undefined {
    const key = this.normalizeKey(url);
    const entry = this.store.get(key);
    if (!entry) return undefined;

    // Check TTL
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return undefined;
    }

    return entry.body;
  }

  /**
   * Store or update a cache entry.
   *
   * If the cache exceeds `maxEntries`, the least recently used entry is evicted.
   */
  set(url: string, etag: string, body: unknown): void {
    const key = this.normalizeKey(url);

    // If key already exists, delete first to update insertion order
    this.store.delete(key);

    // Evict LRU entries if at capacity
    while (this.store.size >= this.maxEntries) {
      // Map.keys().next() returns the oldest (least recently used) entry
      const oldest = this.store.keys().next();
      if (oldest.done) break;
      this.store.delete(oldest.value);
    }

    this.store.set(key, {
      etag,
      body,
      expiry: Date.now() + this.ttlMs,
    });
  }

  /**
   * Remove a cache entry.
   */
  delete(url: string): void {
    this.store.delete(this.normalizeKey(url));
  }

  /**
   * Clear all cached entries.
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Number of entries in the cache (including potentially expired ones).
   */
  get size(): number {
    return this.store.size;
  }

  /**
   * Normalize a URL for use as a cache key.
   *
   * EC43: Removes trailing slashes.
   */
  private normalizeKey(url: string): string {
    return url.replace(/\/+$/, '');
  }
}
