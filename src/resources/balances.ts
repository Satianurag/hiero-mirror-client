/**
 * Balances resource — 3 methods.
 * @internal
 */

import type { HttpClient } from '../http/client.js';
import { mapBalanceEntry } from '../mappers/balance.js';
import { createPageExtractor, Paginator } from '../pagination/paginator.js';
import type { BalanceEntry, BalanceListParams } from '../types/balances.js';
import type { TokenBalance } from '../types/common.js';

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

  /**
   * Get the balance for a single account.
   *
   * Convenience wrapper around `list()` that filters by account ID
   * and extracts the single result. Designed as a drop-in replacement
   * for the deprecated `AccountBalanceQuery`.
   *
   * @example
   * ```ts
   * const balance = await client.balances.getForAccount('0.0.98');
   * console.log(balance.account, balance.balance, balance.tokens);
   * ```
   */
  async getForAccount(accountId: string): Promise<BalanceEntry> {
    const page = await this.list({ 'account.id': accountId, limit: 1 });
    const entry = page.data[0];
    if (entry == null) {
      throw new Error(`No balance found for account ${accountId}`);
    }
    return entry;
  }

  /**
   * Get the balance of a specific token for an account.
   *
   * @example
   * ```ts
   * const tokenBalance = await client.balances.getTokenBalance('0.0.98', '0.0.456');
   * console.log(tokenBalance.token_id, tokenBalance.balance);
   * ```
   *
   * @returns The token balance entry, or `null` if the account does not hold the token.
   */
  async getTokenBalance(accountId: string, tokenId: string): Promise<TokenBalance | null> {
    const entry = await this.getForAccount(accountId);
    return entry.tokens.find((t) => t.token_id === tokenId) ?? null;
  }
}
