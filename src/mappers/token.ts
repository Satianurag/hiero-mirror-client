/**
 * Token response mappers.
 * @internal
 */

import type {
  CustomFees,
  FixedFee,
  FractionAmount,
  FractionalFee,
  RoyaltyFee,
  TokenBalanceEntry,
  TokenDetail,
  TokenNft,
  TokenSummary,
} from '../types/tokens.js';
import { arr, asRecord, bool, ensureString, mapKey, num, str, strReq } from './common.js';

function mapFractionAmount(raw: unknown): FractionAmount {
  const r = asRecord(raw);
  return { numerator: num(r, 'numerator'), denominator: num(r, 'denominator') };
}

function mapFixedFee(raw: unknown): FixedFee {
  const r = asRecord(raw);
  return {
    all_collectors_are_exempt: bool(r, 'all_collectors_are_exempt'),
    amount: strReq(r, 'amount'),
    collector_account_id: strReq(r, 'collector_account_id'),
    denominating_token_id: str(r, 'denominating_token_id'),
  };
}

function mapFractionalFee(raw: unknown): FractionalFee {
  const r = asRecord(raw);
  return {
    all_collectors_are_exempt: bool(r, 'all_collectors_are_exempt'),
    amount: mapFractionAmount(r.amount),
    collector_account_id: strReq(r, 'collector_account_id'),
    denominating_token_id: str(r, 'denominating_token_id'),
    maximum: str(r, 'maximum'),
    minimum: strReq(r, 'minimum'),
    net_of_transfers: bool(r, 'net_of_transfers'),
  };
}

function mapRoyaltyFee(raw: unknown): RoyaltyFee {
  const r = asRecord(raw);
  return {
    all_collectors_are_exempt: bool(r, 'all_collectors_are_exempt'),
    amount: mapFractionAmount(r.amount),
    collector_account_id: strReq(r, 'collector_account_id'),
    fallback_fee: r.fallback_fee != null ? mapFixedFee(r.fallback_fee) : null,
  };
}

function mapCustomFees(raw: unknown): CustomFees {
  const r = asRecord(raw);
  return {
    created_timestamp: strReq(r, 'created_timestamp'),
    fixed_fees: arr(r, 'fixed_fees').map(mapFixedFee),
    fractional_fees: arr(r, 'fractional_fees').map(mapFractionalFee),
    royalty_fees: arr(r, 'royalty_fees').map(mapRoyaltyFee),
  };
}

export function mapTokenSummary(raw: unknown): TokenSummary {
  const r = asRecord(raw);
  return {
    admin_key: mapKey(r.admin_key),
    /** EC14/88: Always string. */
    decimals: ensureString(r.decimals),
    metadata: strReq(r, 'metadata'),
    name: strReq(r, 'name'),
    symbol: strReq(r, 'symbol'),
    token_id: strReq(r, 'token_id'),
    type: strReq(r, 'type') as TokenSummary['type'],
  };
}

export function mapTokenDetail(raw: unknown): TokenDetail {
  const r = asRecord(raw);
  const summary = mapTokenSummary(raw);
  return {
    ...summary,
    auto_renew_account: str(r, 'auto_renew_account'),
    auto_renew_period: str(r, 'auto_renew_period'),
    created_timestamp: strReq(r, 'created_timestamp'),
    custom_fees: mapCustomFees(r.custom_fees),
    deleted: bool(r, 'deleted'),
    expiry_timestamp: str(r, 'expiry_timestamp'),
    fee_schedule_key: mapKey(r.fee_schedule_key),
    freeze_default: bool(r, 'freeze_default'),
    freeze_key: mapKey(r.freeze_key),
    initial_supply: strReq(r, 'initial_supply'),
    kyc_key: mapKey(r.kyc_key),
    max_supply: strReq(r, 'max_supply'),
    memo: strReq(r, 'memo'),
    metadata_key: mapKey(r.metadata_key),
    modified_timestamp: strReq(r, 'modified_timestamp'),
    pause_key: mapKey(r.pause_key),
    pause_status: strReq(r, 'pause_status'),
    supply_key: mapKey(r.supply_key),
    supply_type: strReq(r, 'supply_type'),
    total_supply: strReq(r, 'total_supply'),
    treasury_account_id: strReq(r, 'treasury_account_id'),
    wipe_key: mapKey(r.wipe_key),
  };
}

export function mapTokenNft(raw: unknown): TokenNft {
  const r = asRecord(raw);
  return {
    account_id: strReq(r, 'account_id'),
    created_timestamp: strReq(r, 'created_timestamp'),
    delegating_spender: str(r, 'delegating_spender'),
    deleted: bool(r, 'deleted'),
    metadata: strReq(r, 'metadata'),
    modified_timestamp: strReq(r, 'modified_timestamp'),
    serial_number: strReq(r, 'serial_number'),
    spender: str(r, 'spender'),
    token_id: strReq(r, 'token_id'),
  };
}

export function mapTokenBalanceEntry(raw: unknown): TokenBalanceEntry {
  const r = asRecord(raw);
  return {
    account: strReq(r, 'account'),
    balance: strReq(r, 'balance'),
    decimals: ensureString(r.decimals),
  };
}
