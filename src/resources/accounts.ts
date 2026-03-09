/**
 * Accounts resource — 10 methods.
 * @internal
 */

import type { HttpClient } from '../http/client.js';
import {
  mapAccountDetail,
  mapAccountSummary,
  mapAirdrop,
  mapCryptoAllowance,
  mapNftAllowance,
  mapStakingReward,
  mapTokenAllowance,
  mapTokenRelationship,
} from '../mappers/account.js';
import { mapTokenNft } from '../mappers/token.js';
import { Paginator, createPageExtractor } from '../pagination/paginator.js';
import type {
  AccountDetail,
  AccountListParams,
  AccountNftsParams,
  AccountRewardsParams,
  AccountSummary,
  AccountTokensParams,
  Airdrop,
  AirdropParams,
  AllowanceCryptoParams,
  AllowanceNftParams,
  AllowanceTokenParams,
  CryptoAllowance,
  NftAllowance,
  StakingReward,
  TokenAllowance,
  TokenRelationship,
} from '../types/accounts.js';
import type { TokenNft } from '../types/tokens.js';

export class AccountsResource {
  constructor(private readonly client: HttpClient) {}

  list(params?: AccountListParams): Paginator<AccountSummary> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/accounts',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('accounts', mapAccountSummary),
    });
  }

  async get(idOrAliasOrEvmAddress: string): Promise<AccountDetail> {
    const response = await this.client.get<unknown>(
      `/api/v1/accounts/${encodeURIComponent(idOrAliasOrEvmAddress)}`,
    );
    return mapAccountDetail(response.data);
  }

  getNFTs(idOrAliasOrEvmAddress: string, params?: AccountNftsParams): Paginator<TokenNft> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/accounts/${encodeURIComponent(idOrAliasOrEvmAddress)}/nfts`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('nfts', mapTokenNft),
    });
  }

  getTokens(
    idOrAliasOrEvmAddress: string,
    params?: AccountTokensParams,
  ): Paginator<TokenRelationship> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/accounts/${encodeURIComponent(idOrAliasOrEvmAddress)}/tokens`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('tokens', mapTokenRelationship),
    });
  }

  getRewards(
    idOrAliasOrEvmAddress: string,
    params?: AccountRewardsParams,
  ): Paginator<StakingReward> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/accounts/${encodeURIComponent(idOrAliasOrEvmAddress)}/rewards`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('rewards', mapStakingReward),
    });
  }

  getCryptoAllowances(
    idOrAliasOrEvmAddress: string,
    params?: AllowanceCryptoParams,
  ): Paginator<CryptoAllowance> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/accounts/${encodeURIComponent(idOrAliasOrEvmAddress)}/allowances/crypto`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('allowances', mapCryptoAllowance),
    });
  }

  getTokenAllowances(
    idOrAliasOrEvmAddress: string,
    params?: AllowanceTokenParams,
  ): Paginator<TokenAllowance> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/accounts/${encodeURIComponent(idOrAliasOrEvmAddress)}/allowances/tokens`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('allowances', mapTokenAllowance),
    });
  }

  getNftAllowances(
    idOrAliasOrEvmAddress: string,
    params?: AllowanceNftParams,
  ): Paginator<NftAllowance> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/accounts/${encodeURIComponent(idOrAliasOrEvmAddress)}/allowances/nfts`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('allowances', mapNftAllowance),
    });
  }

  getOutstandingAirdrops(
    idOrAliasOrEvmAddress: string,
    params?: AirdropParams,
  ): Paginator<Airdrop> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/accounts/${encodeURIComponent(idOrAliasOrEvmAddress)}/airdrops/outstanding`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('airdrops', mapAirdrop),
    });
  }

  getPendingAirdrops(idOrAliasOrEvmAddress: string, params?: AirdropParams): Paginator<Airdrop> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/accounts/${encodeURIComponent(idOrAliasOrEvmAddress)}/airdrops/pending`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('airdrops', mapAirdrop),
    });
  }
}
