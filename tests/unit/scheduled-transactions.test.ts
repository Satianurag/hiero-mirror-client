import { describe, expect, it, vi } from 'vitest';
import {
  decodeTransactionBody,
  getSignatureProgress,
  listSchedulesByAccount,
  waitForExecution,
} from '../../src/helpers/scheduled-transactions.js';
import type { Schedule } from '../../src/types/schedules.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeSchedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    admin_key: null,
    consensus_timestamp: '1710000000.000000000',
    creator_account_id: '0.0.100',
    deleted: false,
    executed_timestamp: null,
    expiration_time: null,
    memo: 'test schedule',
    payer_account_id: '0.0.100',
    schedule_id: '0.0.1234',
    signatures: [],
    transaction_body: 'SGVsbG8=', // "Hello" in base64
    wait_for_expiry: false,
    ...overrides,
  };
}

function makeStubSchedulesResource(getResults: Schedule[]) {
  let callIndex = 0;
  return {
    get: vi.fn(async () => {
      const result = getResults[callIndex] ?? getResults[getResults.length - 1];
      callIndex++;
      return result;
    }),
    list: vi.fn(async (params?: Record<string, unknown>) => ({
      data: getResults,
      links: { next: null },
      ...params,
    })),
  };
}

// ---------------------------------------------------------------------------
// decodeTransactionBody
// ---------------------------------------------------------------------------

describe('decodeTransactionBody', () => {
  it('decodes base64 string to hex', () => {
    const result = decodeTransactionBody('SGVsbG8=');
    expect(result.raw).toBe('SGVsbG8=');
    expect(result.hex).toBe('48656c6c6f');
    expect(result.byteLength).toBe(5);
  });

  it('accepts a Schedule object', () => {
    const schedule = makeSchedule({ transaction_body: 'AQID' }); // [1, 2, 3]
    const result = decodeTransactionBody(schedule);
    expect(result.raw).toBe('AQID');
    expect(result.hex).toBe('010203');
    expect(result.byteLength).toBe(3);
  });

  it('handles empty body', () => {
    const result = decodeTransactionBody('');
    expect(result.raw).toBe('');
    expect(result.hex).toBe('');
    expect(result.byteLength).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getSignatureProgress
// ---------------------------------------------------------------------------

describe('getSignatureProgress', () => {
  it('returns progress for a pending schedule', async () => {
    const schedule = makeSchedule({
      signatures: [
        {
          consensus_timestamp: '1710000001.000000000',
          public_key_prefix: 'abc123',
          signature: 'sig1',
          type: 'ED25519',
        },
      ],
      expiration_time: String(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
    });

    const resource = makeStubSchedulesResource([schedule]);
    const progress = await getSignatureProgress(resource as never, '0.0.1234');

    expect(progress.signatureCount).toBe(1);
    expect(progress.signedKeys).toEqual(['abc123']);
    expect(progress.isExecuted).toBe(false);
    expect(progress.isDeleted).toBe(false);
    expect(progress.isWaitingForExpiry).toBe(false);
    expect(progress.timeUntilExpiry).toBeGreaterThan(0);
  });

  it('returns progress for an executed schedule', async () => {
    const schedule = makeSchedule({
      executed_timestamp: '1710000005.000000000',
    });

    const resource = makeStubSchedulesResource([schedule]);
    const progress = await getSignatureProgress(resource as never, '0.0.1234');

    expect(progress.isExecuted).toBe(true);
  });

  it('returns null timeUntilExpiry when no expiration', async () => {
    const schedule = makeSchedule({ expiration_time: null });

    const resource = makeStubSchedulesResource([schedule]);
    const progress = await getSignatureProgress(resource as never, '0.0.1234');

    expect(progress.timeUntilExpiry).toBeNull();
  });

  it('reports wait_for_expiry flag', async () => {
    const schedule = makeSchedule({ wait_for_expiry: true });

    const resource = makeStubSchedulesResource([schedule]);
    const progress = await getSignatureProgress(resource as never, '0.0.1234');

    expect(progress.isWaitingForExpiry).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// waitForExecution
// ---------------------------------------------------------------------------

describe('waitForExecution', () => {
  it('returns immediately if schedule is already executed', async () => {
    const schedule = makeSchedule({
      executed_timestamp: '1710000005.000000000',
    });

    const resource = makeStubSchedulesResource([schedule]);
    const result = await waitForExecution(resource as never, '0.0.1234');

    expect(result.status).toBe('executed');
    expect(result.executed_timestamp).toBe('1710000005.000000000');
    expect(resource.get).toHaveBeenCalledTimes(1);
  });

  it('returns immediately if schedule is deleted', async () => {
    const schedule = makeSchedule({ deleted: true });

    const resource = makeStubSchedulesResource([schedule]);
    const result = await waitForExecution(resource as never, '0.0.1234');

    expect(result.status).toBe('deleted');
    expect(result.executed_timestamp).toBeNull();
  });

  it('polls until executed', async () => {
    const pending = makeSchedule();
    const executed = makeSchedule({ executed_timestamp: '1710000010.000000000' });

    const resource = makeStubSchedulesResource([pending, pending, executed]);
    const onPoll = vi.fn();
    const result = await waitForExecution(resource as never, '0.0.1234', {
      interval: 10,
      onPoll,
    });

    expect(result.status).toBe('executed');
    expect(resource.get).toHaveBeenCalledTimes(3);
    expect(onPoll).toHaveBeenCalledTimes(3);
  });

  it('times out', async () => {
    const pending = makeSchedule();
    const resource = makeStubSchedulesResource([pending]);

    await expect(
      waitForExecution(resource as never, '0.0.1234', {
        interval: 10,
        timeout: 50,
      }),
    ).rejects.toThrow('timed out');
  });

  it('respects abort signal', async () => {
    const pending = makeSchedule();
    const resource = makeStubSchedulesResource([pending]);
    const controller = new AbortController();
    controller.abort();

    await expect(
      waitForExecution(resource as never, '0.0.1234', {
        signal: controller.signal,
      }),
    ).rejects.toThrow('aborted');
  });

  it('detects expiration', async () => {
    const expired = makeSchedule({
      expiration_time: String(Math.floor(Date.now() / 1000) - 100), // 100 seconds ago
    });

    const resource = makeStubSchedulesResource([expired]);
    const result = await waitForExecution(resource as never, '0.0.1234');

    expect(result.status).toBe('expired');
  });
});

// ---------------------------------------------------------------------------
// listSchedulesByAccount
// ---------------------------------------------------------------------------

describe('listSchedulesByAccount', () => {
  it('returns all schedules by default', async () => {
    const schedules = [
      makeSchedule({ schedule_id: '0.0.1' }),
      makeSchedule({ schedule_id: '0.0.2', executed_timestamp: '1710000005.000000000' }),
      makeSchedule({ schedule_id: '0.0.3', deleted: true }),
    ];

    const resource = makeStubSchedulesResource(schedules);
    const result = await listSchedulesByAccount(resource as never, '0.0.100');

    expect(result).toHaveLength(3);
  });

  it('filters pending schedules', async () => {
    const schedules = [
      makeSchedule({ schedule_id: '0.0.1' }),
      makeSchedule({ schedule_id: '0.0.2', executed_timestamp: '1710000005.000000000' }),
      makeSchedule({ schedule_id: '0.0.3', deleted: true }),
    ];

    const resource = makeStubSchedulesResource(schedules);
    const result = await listSchedulesByAccount(resource as never, '0.0.100', {
      status: 'pending',
    });

    expect(result).toHaveLength(1);
    expect(result[0].schedule_id).toBe('0.0.1');
  });

  it('filters executed schedules', async () => {
    const schedules = [
      makeSchedule({ schedule_id: '0.0.1' }),
      makeSchedule({ schedule_id: '0.0.2', executed_timestamp: '1710000005.000000000' }),
    ];

    const resource = makeStubSchedulesResource(schedules);
    const result = await listSchedulesByAccount(resource as never, '0.0.100', {
      status: 'executed',
    });

    expect(result).toHaveLength(1);
    expect(result[0].schedule_id).toBe('0.0.2');
  });

  it('filters deleted schedules', async () => {
    const schedules = [
      makeSchedule({ schedule_id: '0.0.1' }),
      makeSchedule({ schedule_id: '0.0.3', deleted: true }),
    ];

    const resource = makeStubSchedulesResource(schedules);
    const result = await listSchedulesByAccount(resource as never, '0.0.100', {
      status: 'deleted',
    });

    expect(result).toHaveLength(1);
    expect(result[0].schedule_id).toBe('0.0.3');
  });
});
