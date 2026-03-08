/**
 * Network response mappers.
 * @internal
 */

import type { TimestampRange } from '../types/common.js';
import type {
  ExchangeRate,
  ExchangeRateSet,
  Fee,
  FeeSchedule,
  NetworkNode,
  NetworkStake,
  ServiceEndpoint,
  Supply,
} from '../types/network.js';
import { arr, asRecord, num, str, strReq } from './common.js';

function mapTimestampRange(raw: unknown): TimestampRange {
  const r = asRecord(raw);
  return { from: strReq(r, 'from'), to: str(r, 'to') };
}

function mapServiceEndpoint(raw: unknown): ServiceEndpoint {
  const r = asRecord(raw);
  return {
    ip_address_v4: strReq(r, 'ip_address_v4'),
    port: num(r, 'port'),
    domain_name: strReq(r, 'domain_name'),
  };
}

export function mapNetworkNode(raw: unknown): NetworkNode {
  const r = asRecord(raw);
  return {
    admin_key: r.admin_key ?? null,
    description: strReq(r, 'description'),
    file_id: strReq(r, 'file_id'),
    max_stake: strReq(r, 'max_stake'),
    memo: strReq(r, 'memo'),
    min_stake: strReq(r, 'min_stake'),
    node_account_id: strReq(r, 'node_account_id'),
    node_id: num(r, 'node_id'),
    node_cert_hash: strReq(r, 'node_cert_hash'),
    public_key: strReq(r, 'public_key'),
    reward_rate_start: strReq(r, 'reward_rate_start'),
    service_endpoints: arr(r, 'service_endpoints').map(mapServiceEndpoint),
    stake: strReq(r, 'stake'),
    stake_not_rewarded: strReq(r, 'stake_not_rewarded'),
    stake_rewarded: strReq(r, 'stake_rewarded'),
    staking_period: mapTimestampRange(r.staking_period),
    timestamp: mapTimestampRange(r.timestamp),
  };
}

export function mapNetworkStake(raw: unknown): NetworkStake {
  const r = asRecord(raw);
  return {
    max_stake_rewarded: strReq(r, 'max_stake_rewarded'),
    max_staking_reward_rate_per_hbar: strReq(r, 'max_staking_reward_rate_per_hbar'),
    max_total_reward: strReq(r, 'max_total_reward'),
    node_reward_fee_fraction: num(r, 'node_reward_fee_fraction'),
    reserved_staking_rewards: strReq(r, 'reserved_staking_rewards'),
    reward_balance_threshold: strReq(r, 'reward_balance_threshold'),
    stake_total: strReq(r, 'stake_total'),
    staking_period: mapTimestampRange(r.staking_period),
    staking_period_duration: strReq(r, 'staking_period_duration'),
    staking_periods_stored: strReq(r, 'staking_periods_stored'),
    staking_reward_fee_fraction: num(r, 'staking_reward_fee_fraction'),
    staking_reward_rate: strReq(r, 'staking_reward_rate'),
    staking_start_threshold: strReq(r, 'staking_start_threshold'),
    unreserved_staking_reward_balance: strReq(r, 'unreserved_staking_reward_balance'),
  };
}

export function mapExchangeRate(raw: unknown): ExchangeRate {
  const r = asRecord(raw);
  return {
    cent_equivalent: num(r, 'cent_equivalent'),
    expiration_time: num(r, 'expiration_time'),
    hbar_equivalent: num(r, 'hbar_equivalent'),
  };
}

export function mapExchangeRateSet(raw: unknown): ExchangeRateSet {
  const r = asRecord(raw);
  return {
    current_rate: mapExchangeRate(r.current_rate),
    next_rate: mapExchangeRate(r.next_rate),
    timestamp: strReq(r, 'timestamp'),
  };
}

export function mapSupply(raw: unknown): Supply {
  const r = asRecord(raw);
  return {
    released_supply: strReq(r, 'released_supply'),
    timestamp: strReq(r, 'timestamp'),
    total_supply: strReq(r, 'total_supply'),
  };
}

function mapFee(raw: unknown): Fee {
  const r = asRecord(raw);
  return {
    gas: strReq(r, 'gas'),
    transaction_type: strReq(r, 'transaction_type'),
  };
}

export function mapFeeSchedule(raw: unknown): FeeSchedule {
  const r = asRecord(raw);
  return {
    current: r.current != null ? arr(r, 'current').map(mapFee) : undefined,
    next: r.next != null ? arr(r, 'next').map(mapFee) : undefined,
    timestamp: strReq(r, 'timestamp'),
  };
}
