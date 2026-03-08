/**
 * Topic response mapper.
 * @internal
 */

import type { ChunkInfo, TopicMessage } from '../types/topics.js';
import { asRecord, bool, decodeBase64, num, strReq } from './common.js';

function mapChunkInfo(raw: unknown): ChunkInfo | null {
  if (raw == null) return null;
  const r = asRecord(raw);
  const initTxRaw = asRecord(r.initial_transaction_id);
  return {
    initial_transaction_id: {
      account_id: strReq(initTxRaw, 'account_id'),
      nonce: num(initTxRaw, 'nonce'),
      scheduled: bool(initTxRaw, 'scheduled'),
      transaction_valid_start: strReq(initTxRaw, 'transaction_valid_start'),
    },
    number: num(r, 'number'),
    total: num(r, 'total'),
  };
}

/**
 * Maps a raw topic message to a `TopicMessage`.
 *
 * EC3/18: Auto-decodes Base64 `message` and `running_hash` to `Uint8Array`.
 */
export function mapTopicMessage(raw: unknown): TopicMessage {
  const r = asRecord(raw);
  const messageStr = strReq(r, 'message');
  const runningHashStr = strReq(r, 'running_hash');
  return {
    chunk_info: mapChunkInfo(r.chunk_info),
    consensus_timestamp: strReq(r, 'consensus_timestamp'),
    message: decodeBase64(messageStr),
    payer_account_id: strReq(r, 'payer_account_id'),
    running_hash: decodeBase64(runningHashStr),
    running_hash_version: num(r, 'running_hash_version'),
    sequence_number: strReq(r, 'sequence_number'),
    topic_id: strReq(r, 'topic_id'),
  };
}
