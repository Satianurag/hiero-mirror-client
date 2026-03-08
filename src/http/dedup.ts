/**
 * In-flight request deduplication.
 *
 * When multiple calls are made to the same URL concurrently,
 * only one actual `fetch()` is performed. All callers receive
 * the same response promise.
 *
 * Only GET requests are deduplicated (POST/PUT/DELETE are never cached).
 *
 * @internal
 */
export class RequestDedup {
  private readonly inflight = new Map<string, Promise<Response>>();

  /**
   * Executes a fetch, deduplicating concurrent identical GET requests.
   *
   * @param key - Dedup key (usually the full URL)
   * @param fetchFn - The actual fetch function to execute
   * @returns The response promise (shared among concurrent callers)
   */
  async execute(key: string, fetchFn: () => Promise<Response>): Promise<Response> {
    const existing = this.inflight.get(key);
    if (existing) {
      // Clone the response so each consumer gets their own readable body
      return existing.then((r) => r.clone());
    }

    const promise = fetchFn();
    this.inflight.set(key, promise);

    try {
      const response = await promise;
      return response;
    } finally {
      this.inflight.delete(key);
    }
  }

  /**
   * Returns the number of in-flight requests (for testing).
   */
  get size(): number {
    return this.inflight.size;
  }
}
