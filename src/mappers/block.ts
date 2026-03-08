/**
 * Block response mapper.
 * @internal
 */

import type { Block } from '../types/blocks.js';
import { asRecord, num, str, strReq } from './common.js';

export function mapBlock(raw: unknown): Block {
  const r = asRecord(raw);
  const tsRaw = asRecord(r.timestamp);
  return {
    count: num(r, 'count'),
    gas_used: strReq(r, 'gas_used'),
    hapi_version: strReq(r, 'hapi_version'),
    hash: strReq(r, 'hash'),
    logs_bloom: strReq(r, 'logs_bloom'),
    name: strReq(r, 'name'),
    number: num(r, 'number'),
    previous_hash: strReq(r, 'previous_hash'),
    size: num(r, 'size'),
    /** EC15/28: TimestampRange object. */
    timestamp: { from: strReq(tsRaw, 'from'), to: str(tsRaw, 'to') },
  };
}
