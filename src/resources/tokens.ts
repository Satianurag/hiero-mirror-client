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

  list(params?: TokenListParams): Paginator<TokenSummary> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/tokens',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('tokens', mapTokenSummary),
    });
  }

  async get(tokenId: string): Promise<TokenDetail> {
    const response = await this.client.get<unknown>(
      `/api/v1/tokens/${encodeURIComponent(tokenId)}`,
    );
    return mapTokenDetail(response.data);
  }

  getBalances(tokenId: string, params?: TokenBalanceParams): Paginator<TokenBalanceEntry> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/tokens/${encodeURIComponent(tokenId)}/balances`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('balances', mapTokenBalanceEntry),
    });
  }

  getNFTs(tokenId: string, params?: TokenNftListParams): Paginator<TokenNft> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/tokens/${encodeURIComponent(tokenId)}/nfts`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('nfts', mapTokenNft),
    });
  }

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
