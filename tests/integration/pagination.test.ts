import { describe, expect, it } from 'vitest';
import { INTEGRATION_TIMEOUT, client } from './setup.js';

describe('Pagination Integration', { timeout: INTEGRATION_TIMEOUT }, () => {
  it('should auto-paginate across multiple pages', async () => {
    const items: unknown[] = [];
    let count = 0;

    for await (const account of client.accounts.list({ limit: 2 })) {
      items.push(account);
      count++;
      if (count >= 6) break; // Stop after collecting 6 items
    }

    // Should have collected items from multiple pages
    expect(items).toHaveLength(6);
  });

  it('should iterate pages with .pages()', async () => {
    let pageCount = 0;

    for await (const page of client.accounts.list({ limit: 2 }).pages()) {
      expect(page.data.length).toBeGreaterThan(0);
      expect(page).toHaveProperty('links');
      pageCount++;
      if (pageCount >= 2) break;
    }

    expect(pageCount).toBe(2);
  });
});
