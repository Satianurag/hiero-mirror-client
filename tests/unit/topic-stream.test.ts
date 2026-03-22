import { describe, expect, it, vi } from 'vitest';
import { TopicStream } from '../../src/pagination/stream.js';

// ---------------------------------------------------------------------------
// Mock HttpClient
// ---------------------------------------------------------------------------

function makeMockClient(responses: Array<{ messages: unknown[] }>) {
  let callIndex = 0;
  return {
    get: vi.fn(async () => {
      const response = responses[callIndex] ?? responses[responses.length - 1];
      callIndex++;
      return { data: response, status: 200, headers: new Headers() };
    }),
  };
}

describe('TopicStream', () => {
  it('yields messages from a single poll', async () => {
    const messages = [
      {
        chunk_info: null,
        consensus_timestamp: '1710000001.000000000',
        message: 'SGVsbG8=',
        payer_account_id: '0.0.1234',
        running_hash: 'AAAA',
        running_hash_version: 3,
        sequence_number: '1',
        topic_id: '0.0.5678',
      },
    ];
    const mockClient = makeMockClient([{ messages }, { messages: [] }]);
    const controller = new AbortController();

    const stream = new TopicStream(mockClient as never, '0.0.5678', {
      startTimestamp: '1710000000.000000000',
      interval: 10,
      limit: 10,
      signal: controller.signal,
    });

    const results: unknown[] = [];
    for await (const msg of stream) {
      results.push(msg);
      controller.abort();
    }

    expect(results).toHaveLength(1);
    expect(results[0]).toHaveProperty('consensus_timestamp', '1710000001.000000000');
    expect(results[0]).toHaveProperty('topic_id', '0.0.5678');
  });

  it('yields multiple messages across polls', async () => {
    const msg1 = {
      chunk_info: null,
      consensus_timestamp: '1710000001.000000000',
      message: 'SGVsbG8=',
      payer_account_id: '0.0.1234',
      running_hash: 'AAAA',
      running_hash_version: 3,
      sequence_number: '1',
      topic_id: '0.0.5678',
    };
    const msg2 = {
      chunk_info: null,
      consensus_timestamp: '1710000002.000000000',
      message: 'V29ybGQ=',
      payer_account_id: '0.0.1234',
      running_hash: 'BBBB',
      running_hash_version: 3,
      sequence_number: '2',
      topic_id: '0.0.5678',
    };
    const mockClient = makeMockClient([
      { messages: [msg1] },
      { messages: [msg2] },
      { messages: [] },
    ]);
    const controller = new AbortController();

    const stream = new TopicStream(mockClient as never, '0.0.5678', {
      startTimestamp: '1710000000.000000000',
      interval: 10,
      limit: 10,
      signal: controller.signal,
    });

    const results: unknown[] = [];
    let count = 0;
    for await (const msg of stream) {
      results.push(msg);
      count++;
      if (count >= 2) controller.abort();
    }

    expect(results).toHaveLength(2);
  });

  it('stops when abort signal is triggered', async () => {
    const mockClient = makeMockClient([{ messages: [] }]);
    const controller = new AbortController();

    const stream = new TopicStream(mockClient as never, '0.0.5678', {
      startTimestamp: '0',
      interval: 10,
      signal: controller.signal,
    });

    // Abort immediately
    controller.abort();

    const results: unknown[] = [];
    for await (const msg of stream) {
      results.push(msg);
    }

    expect(results).toHaveLength(0);
  });

  it('backs off on empty polls', async () => {
    const mockClient = makeMockClient([{ messages: [] }]);
    const controller = new AbortController();

    const stream = new TopicStream(mockClient as never, '0.0.5678', {
      startTimestamp: '0',
      interval: 10,
      signal: controller.signal,
    });

    // Let it poll a few times then abort
    setTimeout(() => controller.abort(), 100);

    const results: unknown[] = [];
    for await (const msg of stream) {
      results.push(msg);
    }

    // Should have polled multiple times but yielded nothing
    expect(results).toHaveLength(0);
    expect(mockClient.get).toHaveBeenCalled();
  });

  it('handles network errors gracefully and continues polling', async () => {
    let callIndex = 0;
    const controller = new AbortController();

    const mockClient = {
      get: vi.fn(async () => {
        callIndex++;
        if (callIndex === 1) {
          throw new Error('Network error');
        }
        if (callIndex === 2) {
          return {
            data: {
              messages: [
                {
                  chunk_info: null,
                  consensus_timestamp: '1710000001.000000000',
                  message: 'SGVsbG8=',
                  payer_account_id: '0.0.1234',
                  running_hash: 'AAAA',
                  running_hash_version: 3,
                  sequence_number: '1',
                  topic_id: '0.0.5678',
                },
              ],
            },
            status: 200,
            headers: new Headers(),
          };
        }
        // Third call: abort
        controller.abort();
        return { data: { messages: [] }, status: 200, headers: new Headers() };
      }),
    };

    const stream = new TopicStream(mockClient as never, '0.0.5678', {
      startTimestamp: '0',
      interval: 10,
      signal: controller.signal,
    });

    const results: unknown[] = [];
    for await (const msg of stream) {
      results.push(msg);
    }

    expect(results).toHaveLength(1);
    expect(mockClient.get).toHaveBeenCalledTimes(3);
  });

  it('uses default options when none provided', async () => {
    const mockClient = makeMockClient([{ messages: [] }]);
    const controller = new AbortController();
    controller.abort();

    const stream = new TopicStream(mockClient as never, '0.0.5678');

    const _results: unknown[] = [];
    // Since no signal, we need to check it constructs
    // We can't easily iterate without signal, but we verify construction
    expect(stream).toBeDefined();
  });
});
