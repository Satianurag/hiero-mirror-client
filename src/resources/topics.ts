/**
 * Topics resource — 4 methods + stream.
 * @internal
 */

import type { HttpClient } from '../http/client.js';
import { asRecord, bool, str, strReq } from '../mappers/common.js';
import { mapTopicMessage } from '../mappers/topic.js';
import { Paginator, createPageExtractor } from '../pagination/paginator.js';
import { TopicStream } from '../pagination/stream.js';
import type {
  TopicInfo,
  TopicMessage,
  TopicMessageParams,
  TopicStreamOptions,
} from '../types/topics.js';

function mapTopicInfo(raw: unknown): TopicInfo {
  const r = asRecord(raw);
  const tsRaw = asRecord(r.timestamp);
  return {
    admin_key: r.admin_key ?? null,
    auto_renew_account: str(r, 'auto_renew_account'),
    auto_renew_period: str(r, 'auto_renew_period'),
    created_timestamp: strReq(r, 'created_timestamp'),
    deleted: bool(r, 'deleted'),
    memo: strReq(r, 'memo'),
    submit_key: r.submit_key ?? null,
    timestamp: { from: strReq(tsRaw, 'from'), to: str(tsRaw, 'to') },
    topic_id: strReq(r, 'topic_id'),
  };
}

export class TopicsResource {
  constructor(private readonly client: HttpClient) {}

  async get(topicId: string): Promise<TopicInfo> {
    const response = await this.client.get<unknown>(
      `/api/v1/topics/${encodeURIComponent(topicId)}`,
    );
    return mapTopicInfo(response.data);
  }

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

  stream(topicId: string, options?: TopicStreamOptions): TopicStream {
    return new TopicStream(this.client, topicId, options);
  }
}
