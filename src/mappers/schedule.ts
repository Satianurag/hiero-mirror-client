/**
 * Schedule response mapper.
 * @internal
 */

import type { Schedule, ScheduleSignature } from '../types/schedules.js';
import { arr, asRecord, bool, mapKey, str, strReq } from './common.js';

function mapSignature(raw: unknown): ScheduleSignature {
  const r = asRecord(raw);
  return {
    consensus_timestamp: strReq(r, 'consensus_timestamp'),
    public_key_prefix: strReq(r, 'public_key_prefix'),
    signature: strReq(r, 'signature'),
    type: strReq(r, 'type'),
  };
}

/** EC58: Same type for list and detail. */
export function mapSchedule(raw: unknown): Schedule {
  const r = asRecord(raw);
  return {
    admin_key: mapKey(r.admin_key),
    consensus_timestamp: str(r, 'consensus_timestamp'),
    creator_account_id: strReq(r, 'creator_account_id'),
    deleted: bool(r, 'deleted'),
    executed_timestamp: str(r, 'executed_timestamp'),
    expiration_time: str(r, 'expiration_time'),
    memo: strReq(r, 'memo'),
    payer_account_id: strReq(r, 'payer_account_id'),
    schedule_id: strReq(r, 'schedule_id'),
    signatures: arr(r, 'signatures').map(mapSignature),
    transaction_body: strReq(r, 'transaction_body'),
    wait_for_expiry: bool(r, 'wait_for_expiry'),
  };
}
