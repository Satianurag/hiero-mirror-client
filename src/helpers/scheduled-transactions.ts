/**
 * Scheduled transaction helper functions.
 *
 * Provides high-level workflows on top of the raw `SchedulesResource`:
 * - `waitForExecution` — poll until a schedule executes, is deleted, or expires
 * - `getSignatureProgress` — summarise signature state
 * - `listSchedulesByAccount` — convenience filter + post-filter by status
 * - `decodeTransactionBody` — decode the base64 transaction body
 *
 * @packageDocumentation
 */

import type { SchedulesResource } from '../resources/schedules.js';
import type { Schedule } from '../types/schedules.js';
import { base64ToHex } from '../utils/encoding.js';

// ---------------------------------------------------------------------------
// Options & result types
// ---------------------------------------------------------------------------

export interface WaitForExecutionOptions {
  /** Poll interval in ms (default: 2000). */
  interval?: number;
  /** Timeout in ms (default: 120_000 — matches max schedule lifetime). */
  timeout?: number;
  /** AbortSignal for cancellation. */
  signal?: AbortSignal;
  /** Called on each poll with current schedule state. */
  onPoll?: (schedule: Schedule) => void;
}

export interface ExecutionResult {
  schedule: Schedule;
  status: 'executed' | 'deleted' | 'expired';
  /** Timestamp when execution occurred, or null if deleted/expired. */
  executed_timestamp: string | null;
}

export interface SignatureProgress {
  schedule: Schedule;
  /** Total signatures collected. */
  signatureCount: number;
  /** Public key prefixes that have signed. */
  signedKeys: string[];
  /** Whether the schedule has been executed. */
  isExecuted: boolean;
  /** Whether the schedule has been deleted. */
  isDeleted: boolean;
  /** Whether the schedule is waiting for expiry time. */
  isWaitingForExpiry: boolean;
  /** Time remaining until expiration in ms (null if no expiration). */
  timeUntilExpiry: number | null;
}

export interface ListSchedulesByAccountOptions {
  /** Filter by status. */
  status?: 'pending' | 'executed' | 'deleted' | 'all';
  limit?: number;
  order?: 'asc' | 'desc';
}

export interface DecodedScheduleBody {
  /** Raw base64 string. */
  raw: string;
  /** Hex representation. */
  hex: string;
  /** Byte length of the decoded body. */
  byteLength: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Polls a schedule until it reaches a terminal state (executed, deleted, or expired).
 *
 * Uses adaptive polling: starts at the configured interval and backs off
 * on consecutive unchanged polls to reduce unnecessary requests.
 *
 * @param schedules - The `SchedulesResource` instance
 * @param scheduleId - Schedule entity ID (e.g., `0.0.1234`)
 * @param options - Polling configuration
 * @returns The final schedule state with a status label
 */
export async function waitForExecution(
  schedules: SchedulesResource,
  scheduleId: string,
  options: WaitForExecutionOptions = {},
): Promise<ExecutionResult> {
  const interval = options.interval ?? 2000;
  const timeout = options.timeout ?? 120_000;
  const startTime = Date.now();

  while (true) {
    if (options.signal?.aborted) {
      throw new DOMException('The operation was aborted.', 'AbortError');
    }

    const schedule = await schedules.get(scheduleId);
    options.onPoll?.(schedule);

    // Check terminal states
    if (schedule.executed_timestamp != null) {
      return {
        schedule,
        status: 'executed',
        executed_timestamp: schedule.executed_timestamp,
      };
    }

    if (schedule.deleted) {
      return {
        schedule,
        status: 'deleted',
        executed_timestamp: null,
      };
    }

    // Check expiration
    if (schedule.expiration_time != null) {
      const expirySeconds = Number.parseFloat(schedule.expiration_time);
      if (!Number.isNaN(expirySeconds) && Date.now() / 1000 > expirySeconds) {
        return {
          schedule,
          status: 'expired',
          executed_timestamp: null,
        };
      }
    }

    // Check timeout
    if (Date.now() - startTime >= timeout) {
      throw new Error(`waitForExecution timed out after ${timeout}ms for schedule ${scheduleId}`);
    }

    // Wait before next poll
    await sleep(interval, options.signal);
  }
}

/**
 * Returns a summary of signature progress for a scheduled transaction.
 *
 * @param schedules - The `SchedulesResource` instance
 * @param scheduleId - Schedule entity ID (e.g., `0.0.1234`)
 */
export async function getSignatureProgress(
  schedules: SchedulesResource,
  scheduleId: string,
): Promise<SignatureProgress> {
  const schedule = await schedules.get(scheduleId);

  let timeUntilExpiry: number | null = null;
  if (schedule.expiration_time != null) {
    const expiryMs = Number.parseFloat(schedule.expiration_time) * 1000;
    if (!Number.isNaN(expiryMs)) {
      timeUntilExpiry = Math.max(0, expiryMs - Date.now());
    }
  }

  return {
    schedule,
    signatureCount: schedule.signatures.length,
    signedKeys: schedule.signatures.map((sig) => sig.public_key_prefix),
    isExecuted: schedule.executed_timestamp != null,
    isDeleted: schedule.deleted,
    isWaitingForExpiry: schedule.wait_for_expiry,
    timeUntilExpiry,
  };
}

/**
 * Lists schedules associated with an account, with optional status filtering.
 *
 * @param schedules - The `SchedulesResource` instance
 * @param accountId - Account entity ID (e.g., `0.0.1234`)
 * @param options - Filter and pagination options
 */
export async function listSchedulesByAccount(
  schedules: SchedulesResource,
  accountId: string,
  options: ListSchedulesByAccountOptions = {},
): Promise<Schedule[]> {
  const paginator = schedules.list({
    'account.id': accountId,
    limit: options.limit,
    order: options.order,
  });

  const page = await paginator;
  const results = page.data;
  const status = options.status ?? 'all';

  if (status === 'all') {
    return results;
  }

  return results.filter((schedule) => {
    switch (status) {
      case 'executed':
        return schedule.executed_timestamp != null;
      case 'deleted':
        return schedule.deleted;
      case 'pending':
        return schedule.executed_timestamp == null && !schedule.deleted;
      default:
        return true;
    }
  });
}

/**
 * Decodes the base64-encoded transaction body from a schedule.
 *
 * @param schedule - A `Schedule` object (or just the `transaction_body` string)
 */
export function decodeTransactionBody(schedule: Schedule | string): DecodedScheduleBody {
  const raw = typeof schedule === 'string' ? schedule : schedule.transaction_body;
  const hex = base64ToHex(raw);

  return {
    raw,
    hex,
    byteLength: hex.length / 2,
  };
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('The operation was aborted.', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('The operation was aborted.', 'AbortError'));
    };

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
