/**
 * Balance response mapper.
 * @internal
 */

import type { BalanceEntry } from '../types/balances.js';
import type { TokenBalance } from '../types/common.js';
import { arr, asRecord, strReq } from './common.js';

export function mapBalanceEntry(raw: unknown): BalanceEntry {
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
