/**
 * Account response mappers.
 *
 * @internal
 */

import type {
  AccountBalance,
  AccountDetail,
  AccountSummary,
  AccountTransaction,
  Airdrop,
  CryptoAllowance,
  NftAllowance,
  StakingReward,
  TokenAllowance,
  TokenRelationship,
} from '../types/accounts.js';
import type { HieroKey, TokenBalance } from '../types/common.js';
import { arr, asRecord, bool, num, str, strReq } from './common.js';

function mapKey(raw: unknown): HieroKey | null {
  if (raw == null) return null;
  const r = asRecord(raw);
  return {
    _type: strReq(r, '_type'),
    key: strReq(r, 'key'),
  } as HieroKey;
}

function mapTokenBalance(raw: unknown): TokenBalance {
  const r = asRecord(raw);
  return {
    token_id: strReq(r, 'token_id'),
    balance: strReq(r, 'balance'),
  };
}

function mapAccountBalance(raw: unknown): AccountBalance {
  const r = asRecord(raw);
  return {
    balance: strReq(r, 'balance'),
    timestamp: strReq(r, 'timestamp'),
    tokens: arr(r, 'tokens').map(mapTokenBalance),
  };
}

export function mapAccountSummary(raw: unknown): AccountSummary {
  const r = asRecord(raw);
  return {
    account: strReq(r, 'account'),
    alias: str(r, 'alias'),
    auto_renew_period: str(r, 'auto_renew_period'),
    balance: mapAccountBalance(r.balance),
    created_timestamp: str(r, 'created_timestamp'),
    decline_reward: bool(r, 'decline_reward'),
    deleted: bool(r, 'deleted'),
    ethereum_nonce: strReq(r, 'ethereum_nonce'),
    evm_address: str(r, 'evm_address'),
    expiry_timestamp: str(r, 'expiry_timestamp'),
    key: mapKey(r.key),
    max_automatic_token_associations: num(r, 'max_automatic_token_associations'),
    memo: strReq(r, 'memo'),
    pending_reward: strReq(r, 'pending_reward'),
    receiver_sig_required:
      r.receiver_sig_required == null ? null : bool(r, 'receiver_sig_required'),
    staked_account_id: str(r, 'staked_account_id'),
    staked_node_id: r.staked_node_id == null ? null : num(r, 'staked_node_id'),
    stake_period_start: str(r, 'stake_period_start'),
  };
}

export function mapAccountDetail(raw: unknown): AccountDetail {
  const r = asRecord(raw);
  const summary = mapAccountSummary(raw);
  const linksRaw = asRecord(r.links);
  return {
    ...summary,
    transactions: arr(r, 'transactions').map(mapAccountTransaction),
    links: { next: str(linksRaw, 'next') },
  };
}

function mapAccountTransaction(raw: unknown): AccountTransaction {
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

export function mapTokenRelationship(raw: unknown): TokenRelationship {
  const r = asRecord(raw);
  return {
    automatic_association: bool(r, 'automatic_association'),
    balance: strReq(r, 'balance'),
    created_timestamp: strReq(r, 'created_timestamp'),
    decimals: String(r.decimals ?? '0'),
    freeze_status: strReq(r, 'freeze_status') as TokenRelationship['freeze_status'],
    kyc_status: strReq(r, 'kyc_status') as TokenRelationship['kyc_status'],
    token_id: strReq(r, 'token_id'),
  };
}

export function mapStakingReward(raw: unknown): StakingReward {
  const r = asRecord(raw);
  return {
    account_id: strReq(r, 'account_id'),
    amount: strReq(r, 'amount'),
    timestamp: strReq(r, 'timestamp'),
  };
}

function mapTimestampRange(raw: unknown): { from: string; to: string | null } {
  const r = asRecord(raw);
  return { from: strReq(r, 'from'), to: str(r, 'to') };
}

export function mapCryptoAllowance(raw: unknown): CryptoAllowance {
  const r = asRecord(raw);
  return {
    amount: strReq(r, 'amount'),
    amount_granted: strReq(r, 'amount_granted'),
    owner: strReq(r, 'owner'),
    spender: strReq(r, 'spender'),
    timestamp: mapTimestampRange(r.timestamp),
  };
}

export function mapTokenAllowance(raw: unknown): TokenAllowance {
  const r = asRecord(raw);
  return {
    amount: strReq(r, 'amount'),
    amount_granted: strReq(r, 'amount_granted'),
    owner: strReq(r, 'owner'),
    spender: strReq(r, 'spender'),
    token_id: strReq(r, 'token_id'),
    timestamp: mapTimestampRange(r.timestamp),
  };
}

export function mapNftAllowance(raw: unknown): NftAllowance {
  const r = asRecord(raw);
  return {
    approved_for_all: bool(r, 'approved_for_all'),
    owner: strReq(r, 'owner'),
    spender: strReq(r, 'spender'),
    token_id: strReq(r, 'token_id'),
    timestamp: mapTimestampRange(r.timestamp),
  };
}

export function mapAirdrop(raw: unknown): Airdrop {
  const r = asRecord(raw);
  return {
    amount: strReq(r, 'amount'),
    receiver_id: strReq(r, 'receiver_id'),
    sender_id: strReq(r, 'sender_id'),
    serial_number: str(r, 'serial_number'),
    token_id: strReq(r, 'token_id'),
    timestamp: mapTimestampRange(r.timestamp),
  };
}
