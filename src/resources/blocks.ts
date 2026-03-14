/**
 * Blocks resource — 2 methods.
 * @internal
 */

import type { HttpClient } from '../http/client.js';
import { mapBlock } from '../mappers/block.js';
import { createPageExtractor, Paginator } from '../pagination/paginator.js';
import type { Block, BlockListParams } from '../types/blocks.js';

export class BlocksResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * List blocks with optional filtering.
   *
   * @example
   * ```ts
   * const page = await client.blocks.list({ limit: 5 }).next();
   * for (const block of page.data) {
   *   console.log(block.number, block.count);
   * }
   * ```
   */
  list(params?: BlockListParams): Paginator<Block> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/blocks',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('blocks', mapBlock),
    });
  }

  /**
   * Get a block by hash or number.
   *
   * @example
   * ```ts
   * const block = await client.blocks.get(12345);
   * console.log(block.number, block.timestamp);
   * ```
   */
  async get(hashOrNumber: string | number): Promise<Block> {
    const response = await this.client.get<unknown>(
      `/api/v1/blocks/${encodeURIComponent(String(hashOrNumber))}`,
    );
    return mapBlock(response.data);
  }
}
