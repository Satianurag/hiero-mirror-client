/**
 * Tokens resource — 6 methods.
 * @internal
 */

import type { HttpClient } from '../http/client.js';
import {
  mapTokenBalanceEntry,
  mapTokenDetail,
  mapTokenNft,
  mapTokenSummary,
} from '../mappers/token.js';
import { mapNftTransaction } from '../mappers/transaction.js';
import { createPageExtractor, Paginator } from '../pagination/paginator.js';
import type {
  TokenBalanceEntry,
  TokenBalanceParams,
  TokenDetail,
  TokenListParams,
  TokenNft,
  TokenNftListParams,
  TokenSummary,
} from '../types/tokens.js';
import type { NftTransaction, TransactionListParams } from '../types/transactions.js';

export class TokensResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * List tokens with optional filtering.
   *
   * @example
   * ```ts
   * const page = await client.tokens.list({ limit: 10 }).next();
   * for (const token of page.data) {
   *   console.log(token.token_id, token.name, token.symbol);
   * }
   * ```
   */
  list(params?: TokenListParams): Paginator<TokenSummary> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/tokens',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('tokens', mapTokenSummary),
    });
  }

  /**
   * Get detailed token information by ID.
   *
   * @example
   * ```ts
   * const token = await client.tokens.get('0.0.1234');
   * console.log(token.name, token.symbol, token.total_supply);
   * ```
   */
  async get(tokenId: string): Promise<TokenDetail> {
    const response = await this.client.get<unknown>(
      `/api/v1/tokens/${encodeURIComponent(tokenId)}`,
    );
    return mapTokenDetail(response.data);
  }

  /**
   * List balance entries for a specific token.
   *
   * @example
   * ```ts
   * const page = await client.tokens.getBalances('0.0.1234').next();
   * for (const entry of page.data) {
   *   console.log(entry.account, entry.balance);
   * }
   * ```
   */
  getBalances(tokenId: string, params?: TokenBalanceParams): Paginator<TokenBalanceEntry> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/tokens/${encodeURIComponent(tokenId)}/balances`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('balances', mapTokenBalanceEntry),
    });
  }

  /**
   * List NFTs for a specific token.
   *
   * @example
   * ```ts
   * const page = await client.tokens.getNFTs('0.0.1234').next();
   * for (const nft of page.data) {
   *   console.log(nft.serial_number, nft.account_id);
   * }
   * ```
   */
  getNFTs(tokenId: string, params?: TokenNftListParams): Paginator<TokenNft> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/tokens/${encodeURIComponent(tokenId)}/nfts`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('nfts', mapTokenNft),
    });
  }

  /**
   * Get a specific NFT by token ID and serial number.
   *
   * @example
   * ```ts
   * const nft = await client.tokens.getNFTBySerial('0.0.1234', 1);
   * console.log(nft.account_id, nft.metadata);
   * ```
   */
  async getNFTBySerial(tokenId: string, serialNumber: number | string): Promise<TokenNft> {
    const response = await this.client.get<unknown>(
      `/api/v1/tokens/${encodeURIComponent(tokenId)}/nfts/${serialNumber}`,
    );
    return mapTokenNft(response.data);
  }

  getNFTTransactions(
    tokenId: string,
    serialNumber: number | string,
    params?: TransactionListParams,
  ): Paginator<NftTransaction> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/tokens/${encodeURIComponent(tokenId)}/nfts/${serialNumber}/transactions`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('transactions', mapNftTransaction),
    });
  }
}
