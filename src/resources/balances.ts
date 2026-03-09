/**
 * Balances resource — 1 method.
 * @internal
 */

import type { HttpClient } from '../http/client.js';
import { arr, asRecord, strReq } from '../mappers/common.js';
import { Paginator, createPageExtractor } from '../pagination/paginator.js';
import type { BalanceEntry, BalanceListParams } from '../types/balances.js';
import type { TokenBalance } from '../types/common.js';

function mapBalanceEntry(raw: unknown): BalanceEntry {
  const r = asRecord(raw);
  return {
    account: strReq(r, 'account'),
    balance: strReq(r, 'balance'),
    tokens: arr(r, 'tokens').map((t) => {
      const tr = asRecord(t);
      return { token_id: strReq(tr, 'token_id'), balance: strReq(tr, 'balance') } as TokenBalance;
    }),
  };
}

export class BalancesResource {
  constructor(private readonly client: HttpClient) {}

  list(params?: BalanceListParams): Paginator<BalanceEntry> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/balances',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('balances', mapBalanceEntry),
    });
  }
}
