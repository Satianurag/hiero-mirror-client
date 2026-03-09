import { describe, expect, it, vi } from 'vitest';
import type { HttpClient, HttpResponse } from '../../src/http/client.js';
import { Paginator, createPageExtractor } from '../../src/pagination/paginator.js';
import type { Page } from '../../src/types/common.js';

/** Creates a mock HttpClient that returns the given responses in sequence. */
function createMockClient(
  responses: Array<{ data: unknown; headers?: Record<string, string> }>,
): HttpClient {
  let callIndex = 0;
  return {
    get: vi.fn(async () => {
      const resp = responses[callIndex++];
      return {
        data: resp.data,
        status: 200,
        headers: new Headers(resp.headers ?? {}),
      } as HttpResponse<unknown>;
    }),
  } as unknown as HttpClient;
}

const identity = (x: unknown) => x as string;
const extractAccounts = createPageExtractor('accounts', identity);

describe('Paginator — await (first page)', () => {
  it('returns the first page when awaited', async () => {
    const client = createMockClient([{ data: { accounts: ['a1', 'a2'], links: { next: null } } }]);

    const page = await new Paginator({
      client,
      path: '/api/v1/accounts',
      extract: extractAccounts,
    });
    expect(page.data).toEqual(['a1', 'a2']);
    expect(page.links.next).toBeNull();
  });
});

describe('Paginator — for-await-of (items)', () => {
  it('yields individual items across multiple pages', async () => {
    const client = createMockClient([
      {
        data: {
          accounts: ['a1', 'a2'],
          links: { next: '/api/v1/accounts?limit=2&account.id=gt:0.0.2' },
        },
      },
      { data: { accounts: ['a3'], links: { next: null } } },
    ]);

    const items: string[] = [];
    for await (const item of new Paginator({
      client,
      path: '/api/v1/accounts',
      extract: extractAccounts,
    })) {
      items.push(item);
    }
    expect(items).toEqual(['a1', 'a2', 'a3']);
  });

  it('handles empty first page', async () => {
    const client = createMockClient([{ data: { accounts: [], links: { next: null } } }]);

    const items: string[] = [];
    for await (const item of new Paginator({
      client,
      path: '/api/v1/accounts',
      extract: extractAccounts,
    })) {
      items.push(item);
    }
    expect(items).toEqual([]);
  });
});

describe('Paginator — .pages() (page objects)', () => {
  it('yields page objects with links', async () => {
    const client = createMockClient([
      { data: { accounts: ['a1'], links: { next: '/api/v1/accounts?page=2' } } },
      { data: { accounts: ['a2'], links: { next: null } } },
    ]);

    const pages: Page<string>[] = [];
    for await (const page of new Paginator({
      client,
      path: '/api/v1/accounts',
      extract: extractAccounts,
    }).pages()) {
      pages.push(page);
    }
    expect(pages).toHaveLength(2);
    expect(pages[0].data).toEqual(['a1']);
    expect(pages[1].data).toEqual(['a2']);
  });

  it('terminates when links.next is null (EC47)', async () => {
    const client = createMockClient([{ data: { accounts: ['a1'], links: { next: null } } }]);

    const pages: Page<string>[] = [];
    for await (const page of new Paginator({
      client,
      path: '/api/v1/accounts',
      extract: extractAccounts,
    }).pages()) {
      pages.push(page);
    }
    expect(pages).toHaveLength(1);
    expect(client.get).toHaveBeenCalledTimes(1);
  });
});

describe('Paginator — Link header fallback (EC48)', () => {
  it('falls back to Link header when links.next is null', async () => {
    const client = createMockClient([
      {
        data: { accounts: ['a1'], links: { next: null } },
        headers: { link: '</api/v1/accounts?page=2>; rel="next"' },
      },
      { data: { accounts: ['a2'], links: { next: null } } },
    ]);

    const items: string[] = [];
    for await (const item of new Paginator({
      client,
      path: '/api/v1/accounts',
      extract: extractAccounts,
    })) {
      items.push(item);
    }
    expect(items).toEqual(['a1', 'a2']);
  });
});

describe('createPageExtractor', () => {
  it('extracts data array and links from standard envelope', () => {
    const extract = createPageExtractor('items', (x) => (x as { id: number }).id);
    const page = extract({
      items: [{ id: 1 }, { id: 2 }],
      links: { next: '/api/v1/items?page=2' },
    });
    expect(page.data).toEqual([1, 2]);
    expect(page.links.next).toBe('/api/v1/items?page=2');
  });

  it('returns empty data for missing key', () => {
    const extract = createPageExtractor('stuff', identity);
    const page = extract({ links: { next: null } });
    expect(page.data).toEqual([]);
  });

  it('returns null links.next for missing links', () => {
    const extract = createPageExtractor('items', identity);
    const page = extract({ items: ['x'] });
    expect(page.links.next).toBeNull();
  });

  it('handles null input', () => {
    const extract = createPageExtractor('items', identity);
    const page = extract(null);
    expect(page.data).toEqual([]);
    expect(page.links.next).toBeNull();
  });
});
