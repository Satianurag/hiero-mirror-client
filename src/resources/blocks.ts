/**
 * Blocks resource — 2 methods.
 * @internal
 */

import type { HttpClient } from '../http/client.js';
import { mapBlock } from '../mappers/block.js';
import { Paginator, createPageExtractor } from '../pagination/paginator.js';
import type { Block, BlockListParams } from '../types/blocks.js';

export class BlocksResource {
  constructor(private readonly client: HttpClient) {}

  list(params?: BlockListParams): Paginator<Block> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/blocks',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('blocks', mapBlock),
    });
  }

  async get(hashOrNumber: string | number): Promise<Block> {
    const response = await this.client.get<unknown>(
      `/api/v1/blocks/${encodeURIComponent(String(hashOrNumber))}`,
    );
    return mapBlock(response.data);
  }
}
