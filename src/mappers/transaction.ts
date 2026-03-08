/**
 * Transaction response mappers.
 *
 * EC21/150/151: `.get()` must unwrap `{ transactions: [...] }` → single object.
 *
 * @internal
 */

import type { NftTransaction, Transaction } from '../types/transactions.js';
import { arr, asRecord, bool, num, str, strReq } from './common.js';

export function mapTransaction(raw: unknown): Transaction {
  const r = asRecord(raw);
  return {
    bytes: str(r, 'bytes'),
    charged_tx_fee: strReq(r, 'charged_tx_fee'),
    consensus_timestamp: strReq(r, 'consensus_timestamp'),
    entity_id: str(r, 'entity_id'),
    max_fee: strReq(r, 'max_fee'),
    memo_base64: strReq(r, 'memo_base64'),
    name: strReq(r, 'name'),
    nft_transfers: arr(r, 'nft_transfers').map((t) => {
      const tr = asRecord(t);
      return {
        is_approval: bool(tr, 'is_approval'),
        receiver_account_id: str(tr, 'receiver_account_id'),
        sender_account_id: str(tr, 'sender_account_id'),
        serial_number: strReq(tr, 'serial_number'),
        token_id: strReq(tr, 'token_id'),
      };
    }),
    node: str(r, 'node'),
    nonce: num(r, 'nonce'),
    parent_consensus_timestamp: str(r, 'parent_consensus_timestamp'),
    result: strReq(r, 'result'),
    scheduled: bool(r, 'scheduled'),
    staking_reward_transfers: arr(r, 'staking_reward_transfers').map((s) => {
      const sr = asRecord(s);
      return { account: strReq(sr, 'account'), amount: strReq(sr, 'amount') };
    }),
    token_transfers: arr(r, 'token_transfers').map((t) => {
      const tr = asRecord(t);
      return {
        account: strReq(tr, 'account'),
        amount: strReq(tr, 'amount'),
        is_approval: bool(tr, 'is_approval'),
        token_id: strReq(tr, 'token_id'),
      };
    }),
    transaction_hash: strReq(r, 'transaction_hash'),
    transaction_id: strReq(r, 'transaction_id'),
    transfers: arr(r, 'transfers').map((t) => {
      const tr = asRecord(t);
      return {
        account: strReq(tr, 'account'),
        amount: strReq(tr, 'amount'),
        is_approval: bool(tr, 'is_approval'),
      };
    }),
    valid_duration_seconds: strReq(r, 'valid_duration_seconds'),
    valid_start_timestamp: strReq(r, 'valid_start_timestamp'),
  };
}

/**
 * Unwraps the `{ transactions: [...] }` envelope returned by GET /transactions/{id}.
 *
 * EC21/150/151: Detail endpoint wraps in array. `.get()` extracts `transactions[0]`.
 */
export function unwrapTransaction(raw: unknown): Transaction {
  const r = asRecord(raw);
  const txns = arr(r, 'transactions');
  if (txns.length === 0) {
    throw new Error('Transaction response contained empty transactions array');
  }
  return mapTransaction(txns[0]);
}

/** EC77: NFT transaction has a separate shape. */
export function mapNftTransaction(raw: unknown): NftTransaction {
  const r = asRecord(raw);
  return {
    consensus_timestamp: strReq(r, 'consensus_timestamp'),
    is_approval: bool(r, 'is_approval'),
    nonce: num(r, 'nonce'),
    receiver_account_id: str(r, 'receiver_account_id'),
    sender_account_id: str(r, 'sender_account_id'),
    transaction_id: strReq(r, 'transaction_id'),
    type: strReq(r, 'type'),
  };
}
