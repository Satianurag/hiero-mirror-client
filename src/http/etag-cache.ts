/**
 * LRU ETag cache with TTL for conditional HTTP requests.
 *
 * - Stores `{etag, body, createdAt}` per normalized URL
 * - Evicts least-recently-used entries when `maxSize` is exceeded
 * - Evicts entries older than `ttlMs`
 * - Sends `If-None-Match` on subsequent requests
 * - Returns cached body on 304 Not Modified
 * - Updates on 200 OK
 *
 * EC145: All Mirror Node ETags are weak (W/"...").
 *
 * @internal
 * @packageDocumentation
 */

export interface ETagEntry {
  etag: string;
  body: unknown;
  createdAt: number;
}

export interface ETagCacheOptions {
  /** Maximum number of entries. Default: 500. */
  maxSize?: number;
  /** Time-to-live in milliseconds. Default: 300_000 (5 minutes). */
  ttlMs?: number;
}

/**
 * LRU ETag cache with configurable max size and TTL.
 *
 * Uses `Map` insertion order for LRU tracking:
 * accessing an entry deletes and re-inserts it so it moves to the end.
 * Eviction removes the oldest (first) entry.
 */
export class ETagCache {
  private readonly store = new Map<string, ETagEntry>();
  private readonly maxSize: number;
  private readonly ttlMs: number;

  constructor(options?: ETagCacheOptions) {
    this.maxSize = options?.maxSize ?? 500;
    this.ttlMs = options?.ttlMs ?? 300_000;
  }

  /**
   * Look up a cached ETag for the given URL.
   * Returns `undefined` if not cached or expired.
   */
  getETag(url: string): string | undefined {
    const entry = this.getEntry(url);
    return entry?.etag;
  }

  /**
   * Look up the cached response body for the given URL.
   * Returns `undefined` if not cached or expired.
   */
  getCachedBody(url: string): unknown | undefined {
    const entry = this.getEntry(url);
    return entry?.body;
  }

  /**
   * Store or update a cache entry.
   * If the cache is full, evicts the least-recently-used entry.
   */
  set(url: string, etag: string, body: unknown): void {
    const key = this.normalizeKey(url);

    // Delete first to refresh insertion order (LRU).
    this.store.delete(key);

    // Evict oldest entries if at capacity.
    while (this.store.size >= this.maxSize) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) {
        this.store.delete(oldest);
      }
    }

    this.store.set(key, { etag, body, createdAt: Date.now() });
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
   * Internal: get entry if not expired, refreshing LRU position.
   */
  private getEntry(url: string): ETagEntry | undefined {
    const key = this.normalizeKey(url);
    const entry = this.store.get(key);

    if (!entry) return undefined;

    // TTL check
    if (Date.now() - entry.createdAt > this.ttlMs) {
      this.store.delete(key);
      return undefined;
    }

    // Refresh LRU position: delete + re-insert moves to end.
    this.store.delete(key);
    this.store.set(key, entry);

    return entry;
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
