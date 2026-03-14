/**
 * Balances resource — 1 method.
 * @internal
 */

import type { HttpClient } from '../http/client.js';
import { mapBalanceEntry } from '../mappers/balance.js';
import { createPageExtractor, Paginator } from '../pagination/paginator.js';
import type { BalanceEntry, BalanceListParams } from '../types/balances.js';

export class BalancesResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * List account balances with optional filtering.
   *
   * @example
   * ```ts
   * const page = await client.balances.list({ 'account.id': '0.0.1234' }).next();
   * for (const entry of page.data) {
   *   console.log(entry.account, entry.balance);
   * }
   * ```
   */
  list(params?: BalanceListParams): Paginator<BalanceEntry> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/balances',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('balances', mapBalanceEntry),
    });
  }
}
