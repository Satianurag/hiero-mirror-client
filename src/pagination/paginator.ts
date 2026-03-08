/**
 * Paginator class for iterating over paginated Mirror Node API responses.
 *
 * Supports three usage patterns:
 *
 * 1. **Await** — returns the first page:
 *    ```ts
 *    const page = await client.accounts.list();
 *    ```
 *
 * 2. **for-await-of** — yields individual items across all pages:
 *    ```ts
 *    for await (const account of client.accounts.list()) {
 *      console.log(account);
 *    }
 *    ```
 *
 * 3. **`.pages()`** — yields page objects:
 *    ```ts
 *    for await (const page of client.accounts.list().pages()) {
 *      console.log(`Got ${page.data.length} items`);
 *    }
 *    ```
 *
 * @packageDocumentation
 */

import type { HttpClient, HttpResponse } from '../http/client.js';
import type { Page, PaginationLinks } from '../types/common.js';

/**
 * A function that extracts `/api/v1/...` items from a raw API response
 * and returns a {@link Page} of mapped items.
 */
export type PageExtractor<T> = (raw: unknown) => Page<T>;

/**
 * Configuration for creating a Paginator.
 */
export interface PaginatorOptions<T> {
  /** The HTTP client instance. */
  client: HttpClient;
  /** The initial API path (e.g., `/api/v1/accounts`). */
  path: string;
  /** Query parameters for the first request. */
  params?: Record<string, unknown>;
  /** Mapper function: raw JSON → Page<T>. */
  extract: PageExtractor<T>;
}

/**
 * Lazy paginator that fetches pages on demand.
 *
 * Implements `PromiseLike<Page<T>>` so `await` returns the first page.
 * Implements `AsyncIterable<T>` so `for await...of` yields items.
 *
 * EC19: Uses `links.next` as an opaque cursor (never constructs cursors).
 * EC47: Terminates when `links.next` is null.
 * EC8: Resolves relative `links.next` URLs against the base URL.
 */
export class Paginator<T> implements PromiseLike<Page<T>>, AsyncIterable<T> {
  private readonly client: HttpClient;
  private readonly initialPath: string;
  private readonly params?: Record<string, unknown>;
  private readonly extract: PageExtractor<T>;

  constructor(options: PaginatorOptions<T>) {
    this.client = options.client;
    this.initialPath = options.path;
    this.params = options.params;
    this.extract = options.extract;
  }

  // --------------------------------------------------------------------------
  // PromiseLike — `await paginator` returns the first page.
  // --------------------------------------------------------------------------

  then<TResult1 = Page<T>, TResult2 = never>(
    onfulfilled?: ((value: Page<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.fetchFirstPage().then(onfulfilled, onrejected);
  }

  // --------------------------------------------------------------------------
  // AsyncIterable — `for await (const item of paginator)` yields items.
  // --------------------------------------------------------------------------

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    for await (const page of this.pages()) {
      yield* page.data;
    }
  }

  // --------------------------------------------------------------------------
  // Page iterator — yields Page<T> objects.
  // --------------------------------------------------------------------------

  /**
   * Returns an async iterable of page objects.
   *
   * Follows `links.next` until null (EC47).
   */
  async *pages(): AsyncIterable<Page<T>> {
    let nextPath: string | null = this.initialPath;
    let isFirst = true;

    while (nextPath != null) {
      const response: HttpResponse<unknown> = isFirst
        ? await this.client.get(nextPath, this.params as Record<string, string>)
        : await this.client.get(nextPath);

      isFirst = false;

      const page = this.extract(response.data);

      // EC48: Also check for Link header as fallback.
      if (page.links.next == null) {
        const linkHeader = response.headers.get('link') ?? response.headers.get('Link');
        if (linkHeader) {
          const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
          if (match?.[1]) {
            page.links.next = match[1];
          }
        }
      }

      yield page;

      // EC47: Terminate when links.next is null.
      nextPath = page.links.next;

      // EC8/19: links.next is a relative path like `/api/v1/accounts?...`.
      // The HttpClient.get() already resolves against baseUrl.
    }
  }

  // --------------------------------------------------------------------------
  // Internal
  // --------------------------------------------------------------------------

  private async fetchFirstPage(): Promise<Page<T>> {
    const response = await this.client.get<unknown>(
      this.initialPath,
      this.params as Record<string, string>,
    );
    return this.extract(response.data);
  }
}

// ---------------------------------------------------------------------------
// Helper: extract page from common envelope shapes
// ---------------------------------------------------------------------------

/**
 * Creates a standard page extractor for the common envelope:
 * `{ <key>: T[], links: { next: string | null } }`
 */
export function createPageExtractor<T>(
  dataKey: string,
  mapItem: (raw: unknown) => T,
): PageExtractor<T> {
  return (raw: unknown): Page<T> => {
    const record =
      raw != null && typeof raw === 'object' && !Array.isArray(raw)
        ? (raw as Record<string, unknown>)
        : {};

    const items = Array.isArray(record[dataKey]) ? (record[dataKey] as unknown[]).map(mapItem) : [];

    const linksRaw =
      record.links != null && typeof record.links === 'object'
        ? (record.links as Record<string, unknown>)
        : {};

    const links: PaginationLinks = {
      next: typeof linksRaw.next === 'string' ? linksRaw.next : null,
    };

    return { data: items, links };
  };
}
