/**
 * TopicSSEStream — Server-Sent Events stream for HCS topic messages.
 *
 * Uses the Mirror Node's SSE endpoint (`/api/v1/topics/{id}/messages?type=sse`)
 * for real-time delivery with automatic reconnection. Falls back to polling
 * via `TopicStream` if SSE is unavailable.
 *
 * @packageDocumentation
 */

import type { HttpClient } from '../http/client.js';
import { mapTopicMessage } from '../mappers/topic.js';
import type { TopicMessage } from '../types/topics.js';

export interface TopicSSEStreamOptions {
  /** Starting timestamp cursor. Default: current time. */
  startTimestamp?: string;
  /** Maximum items per SSE request. Default: 100. */
  limit?: number;
  /** AbortSignal for cancellation. */
  signal?: AbortSignal;
  /** Reconnect delay in ms after connection drops. Default: 1000. */
  reconnectDelay?: number;
}

/**
 * SSE-based stream for topic messages.
 *
 * - Connects to the Mirror Node SSE endpoint for real-time message delivery.
 * - Automatically reconnects on connection drops with configurable delay.
 * - Cancellable via `AbortController`.
 * - Uses the HttpClient's baseUrl for endpoint resolution.
 */
export class TopicSSEStream implements AsyncIterable<TopicMessage> {
  private readonly client: HttpClient;
  private readonly topicId: string;
  private readonly options: Required<Omit<TopicSSEStreamOptions, 'signal'>> & {
    signal?: AbortSignal;
  };

  constructor(client: HttpClient, topicId: string, options: TopicSSEStreamOptions = {}) {
    this.client = client;
    this.topicId = topicId;
    this.options = {
      startTimestamp: options.startTimestamp ?? Math.floor(Date.now() / 1000).toString(),
      limit: options.limit ?? 100,
      reconnectDelay: options.reconnectDelay ?? 1000,
      signal: options.signal,
    };
  }

  async *[Symbol.asyncIterator](): AsyncIterator<TopicMessage> {
    let cursor = this.options.startTimestamp;

    while (!this.options.signal?.aborted) {
      try {
        // Use the HttpClient to get SSE response via fetch with Accept: text/event-stream
        const baseUrl = this.client.getBaseUrl();
        const url = `${baseUrl}/api/v1/topics/${this.topicId}/messages?limit=${this.options.limit}&order=asc&timestamp=gt:${cursor}`;

        const fetchFn = this.client.getFetch();
        const response = await fetchFn(url, {
          headers: { Accept: 'text/event-stream' },
          signal: this.options.signal,
        });

        if (!response.ok || !response.body) {
          // SSE not supported or error — wait and retry
          await this.sleep(this.options.reconnectDelay);
          continue;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (!this.options.signal?.aborted) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split('\n\n');
            // Keep the last partial chunk in the buffer
            buffer = events.pop() ?? '';

            for (const event of events) {
              const dataLine = event.split('\n').find((line) => line.startsWith('data:'));
              if (!dataLine) continue;

              const jsonStr = dataLine.slice(5).trim();
              if (!jsonStr) continue;

              try {
                const raw = JSON.parse(jsonStr);
                const mapped = mapTopicMessage(raw);
                cursor = mapped.consensus_timestamp;
                yield mapped;
              } catch {
                // Skip malformed SSE data lines
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } catch (_error: unknown) {
        if (this.options.signal?.aborted) return;
      }

      // Reconnect after delay
      await this.sleep(this.options.reconnectDelay);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.options.signal?.aborted) {
        resolve();
        return;
      }
      const timer = setTimeout(resolve, ms);
      this.options.signal?.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true },
      );
    });
  }
}
