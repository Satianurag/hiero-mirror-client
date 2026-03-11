/**
 * In-memory ETag cache for conditional HTTP requests with LRU eviction.
 *
 * - Stores `{etag, body, lastAccessed}` per normalized URL
 * - Sends `If-None-Match` on subsequent requests
 * - Returns cached body on 304 Not Modified
 * - Updates on 200 OK
 * - LRU eviction when cache exceeds `maxSize`
 * - TTL-based expiry for stale entries
 *
 * EC145: All Mirror Node ETags are weak (W/"...").
 *
 * @internal
 * @packageDocumentation
 */

export interface ETagEntry {
  etag: string;
  body: unknown;
  /** Timestamp (ms) when this entry was last accessed/updated. */
  lastAccessed: number;
}

export interface ETagCacheOptions {
  /** Maximum number of entries before LRU eviction kicks in. Default: 500. */
  maxSize?: number;
  /** Time-to-live in milliseconds. Entries older than this are stale. Default: 300_000 (5 min). */
  ttl?: number;
}

/**
 * LRU ETag cache with TTL-based expiry.
 *
 * Keys are normalized URLs (no trailing slashes).
 */
export class ETagCache {
  private readonly store = new Map<string, ETagEntry>();
  private readonly maxSize: number;
  private readonly ttl: number;

  constructor(options: ETagCacheOptions = {}) {
    this.maxSize = options.maxSize ?? 500;
    this.ttl = options.ttl ?? 300_000; // 5 minutes default
  }

  /**
   * Look up a cached ETag for the given URL.
   *
   * Returns `undefined` if not cached or if the entry has expired.
   */
  getETag(url: string): string | undefined {
    const key = this.normalizeKey(url);
    const entry = this.store.get(key);
    if (!entry) return undefined;

    // Check TTL
    if (Date.now() - entry.lastAccessed > this.ttl) {
      this.store.delete(key);
      return undefined;
    }

    // Move to end (most recently used) by re-inserting
    this.store.delete(key);
    entry.lastAccessed = Date.now();
    this.store.set(key, entry);

    return entry.etag;
  }

  /**
   * Look up the cached response body for the given URL.
   *
   * Returns `undefined` if not cached or expired.
   */
  getCachedBody(url: string): unknown | undefined {
    const key = this.normalizeKey(url);
    const entry = this.store.get(key);
    if (!entry) return undefined;

    // Check TTL
    if (Date.now() - entry.lastAccessed > this.ttl) {
      this.store.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.store.delete(key);
    entry.lastAccessed = Date.now();
    this.store.set(key, entry);

    return entry.body;
  }

  /**
   * Store or update a cache entry. Evicts the least-recently-used entry
   * if the cache exceeds `maxSize`.
   */
  set(url: string, etag: string, body: unknown): void {
    const key = this.normalizeKey(url);

    // If key already exists, delete first to update insertion order
    this.store.delete(key);

    // Evict LRU entries if at capacity
    while (this.store.size >= this.maxSize) {
      // Map iterator yields in insertion order; first key is the LRU
      const lruKey = this.store.keys().next().value;
      if (lruKey !== undefined) {
        this.store.delete(lruKey);
      } else {
        break;
      }
    }

    this.store.set(key, { etag, body, lastAccessed: Date.now() });
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
   * Number of entries in the cache.
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
