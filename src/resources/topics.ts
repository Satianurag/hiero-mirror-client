/**
 * Topics resource — 4 methods + stream.
 * @internal
 */

import type { HttpClient } from '../http/client.js';
import { mapTopicInfo, mapTopicMessage } from '../mappers/topic.js';
import { createPageExtractor, Paginator } from '../pagination/paginator.js';
import { TopicStream, type TopicStreamOptions } from '../pagination/stream.js';
import type { TopicInfo, TopicMessage, TopicMessageParams } from '../types/topics.js';

export class TopicsResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * Get topic information by ID.
   *
   * @example
   * ```ts
   * const topic = await client.topics.get('0.0.1234');
   * console.log(topic.topic_id, topic.memo);
   * ```
   */
  async get(topicId: string): Promise<TopicInfo> {
    const response = await this.client.get<unknown>(
      `/api/v1/topics/${encodeURIComponent(topicId)}`,
    );
    return mapTopicInfo(response.data);
  }

  /**
   * List messages for a topic.
   *
   * @example
   * ```ts
   * const page = await client.topics.getMessages('0.0.1234').next();
   * for (const msg of page.data) {
   *   console.log(msg.sequence_number, msg.message);
   * }
   * ```
   */
  getMessages(topicId: string, params?: TopicMessageParams): Paginator<TopicMessage> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/topics/${encodeURIComponent(topicId)}/messages`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('messages', mapTopicMessage),
    });
  }

  async getMessageBySequence(
    topicId: string,
    sequenceNumber: number | string,
  ): Promise<TopicMessage> {
    const response = await this.client.get<unknown>(
      `/api/v1/topics/${encodeURIComponent(topicId)}/messages/${sequenceNumber}`,
    );
    return mapTopicMessage(response.data);
  }

  async getMessageByTimestamp(timestamp: string): Promise<TopicMessage> {
    const response = await this.client.get<unknown>(
      `/api/v1/topics/messages/${encodeURIComponent(timestamp)}`,
    );
    return mapTopicMessage(response.data);
  }

  /**
   * Stream topic messages in real time via long-polling.
   *
   * @example
   * ```ts
   * const stream = client.topics.stream('0.0.1234');
   * for await (const msg of stream) {
   *   console.log(msg.sequence_number, msg.message);
   * }
   * ```
   */
  stream(topicId: string, options?: TopicStreamOptions): TopicStream {
    return new TopicStream(this.client, topicId, options);
  }
}
