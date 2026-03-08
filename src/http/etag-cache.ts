/**
 * In-memory ETag cache for conditional HTTP requests.
 *
 * - Stores `{etag, body}` per normalized URL
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
}

/**
 * Simple in-memory ETag cache.
 *
 * Keys are normalized URLs (no trailing slashes).
 */
export class ETagCache {
  private readonly store = new Map<string, ETagEntry>();

  /**
   * Look up a cached ETag for the given URL.
   *
   * @returns The cached ETag string, or `undefined` if not cached.
   */
  getETag(url: string): string | undefined {
    return this.store.get(this.normalizeKey(url))?.etag;
  }

  /**
   * Look up the cached response body for the given URL.
   *
   * @returns The cached body, or `undefined` if not cached.
   */
  getCachedBody(url: string): unknown | undefined {
    return this.store.get(this.normalizeKey(url))?.body;
  }

  /**
   * Store or update a cache entry.
   */
  set(url: string, etag: string, body: unknown): void {
    this.store.set(this.normalizeKey(url), { etag, body });
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
