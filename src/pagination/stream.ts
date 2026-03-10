/**
 * TopicStream — adaptive polling for Hedera Consensus Service topic messages.
 *
 * @packageDocumentation
 */

import type { HttpClient } from '../http/client.js';
import { mapTopicMessage } from '../mappers/topic.js';
import type { TopicMessage } from '../types/topics.js';

export interface TopicStreamOptions {
  /** Starting timestamp cursor. Default: current time. */
  startTimestamp?: string;
  /** Base polling interval in ms. Default: 500ms (active), backs off to 5s. */
  interval?: number;
  /** Maximum items per poll request. Default: 100. */
  limit?: number;
  /** AbortSignal for cancellation. */
  signal?: AbortSignal;
}

/**
 * Adaptive polling stream for topic messages.
 *
 * - Polls at high frequency (500ms) when messages are flowing.
 * - Backs off exponentially (up to 5s) when no messages arrive.
 * - Cancellable via `AbortController` or `await using`.
 * - Rate-limit aware (shares the HttpClient's token bucket).
 */
export class TopicStream implements AsyncIterable<TopicMessage>, AsyncDisposable {
  private readonly client: HttpClient;
  private readonly topicId: string;
  private readonly options: Required<Omit<TopicStreamOptions, 'signal'>> & { signal?: AbortSignal };
  private readonly internalController: AbortController;
  private readonly composedSignal: AbortSignal;

  /** Minimum polling interval (ms). */
  private static readonly MIN_INTERVAL = 500;
  /** Maximum polling interval (ms). */
  private static readonly MAX_INTERVAL = 5000;
  /** Factor by which interval increases on empty polls. */
  private static readonly BACKOFF_FACTOR = 1.5;

  constructor(client: HttpClient, topicId: string, options: TopicStreamOptions = {}) {
    this.client = client;
    this.topicId = topicId;
    this.internalController = new AbortController();
    this.options = {
      startTimestamp: options.startTimestamp ?? Math.floor(Date.now() / 1000).toString(),
      interval: options.interval ?? TopicStream.MIN_INTERVAL,
      limit: options.limit ?? 100,
      signal: options.signal,
    };

    // Compose external signal (if any) with internal controller
    const signals: AbortSignal[] = [this.internalController.signal];
    if (options.signal) {
      signals.push(options.signal);
    }
    this.composedSignal = AbortSignal.any(signals);
  }

  async *[Symbol.asyncIterator](): AsyncIterator<TopicMessage> {
    let cursor = this.options.startTimestamp;
    let currentInterval = this.options.interval;

    while (!this.composedSignal.aborted) {
      try {
        const response = await this.client.get<unknown>(
          `/api/v1/topics/${this.topicId}/messages`,
          {
            timestamp: `gt:${cursor}`,
            limit: String(this.options.limit),
            order: 'asc',
          },
          { signal: this.composedSignal },
        );

        const raw = response.data as Record<string, unknown>;
        const messages = Array.isArray(raw.messages) ? raw.messages : [];

        if (messages.length > 0) {
          // Active flow — reset interval to minimum.
          currentInterval = TopicStream.MIN_INTERVAL;

          for (const msg of messages) {
            const mapped = mapTopicMessage(msg);
            yield mapped;
            cursor = mapped.consensus_timestamp;
          }
        } else {
          // No messages — back off.
          currentInterval = Math.min(
            currentInterval * TopicStream.BACKOFF_FACTOR,
            TopicStream.MAX_INTERVAL,
          );
        }
      } catch (_error: unknown) {
        // On abort, exit gracefully.
        if (this.composedSignal.aborted) return;

        // On network errors, back off and retry.
        currentInterval = Math.min(
          currentInterval * TopicStream.BACKOFF_FACTOR * 2,
          TopicStream.MAX_INTERVAL,
        );
      }

      // Wait before next poll.
      await this.sleep(currentInterval);
    }
  }

  // --------------------------------------------------------------------------
  // AsyncDisposable — `await using` support
  // --------------------------------------------------------------------------

  async [Symbol.asyncDispose](): Promise<void> {
    this.internalController.abort();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, ms);
      // If the signal aborts, resolve immediately.
      this.composedSignal.addEventListener(
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
