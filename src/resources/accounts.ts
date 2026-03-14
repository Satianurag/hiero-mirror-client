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
import { createPageExtractor, Paginator } from '../pagination/paginator.js';
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

  /**
   * List accounts with optional filtering.
   *
   * @example
   * ```ts
   * const page = await client.accounts.list({ limit: 10 }).next();
   * for (const account of page.data) {
   *   console.log(account.account, account.balance.balance);
   * }
   * ```
   */
  list(params?: AccountListParams): Paginator<AccountSummary> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/accounts',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('accounts', mapAccountSummary),
    });
  }

  /**
   * Get detailed account information by ID, alias, or EVM address.
   *
   * @example
   * ```ts
   * const account = await client.accounts.get('0.0.1234');
   * console.log(account.balance, account.key);
   * ```
   */
  async get(idOrAliasOrEvmAddress: string): Promise<AccountDetail> {
    const response = await this.client.get<unknown>(
      `/api/v1/accounts/${encodeURIComponent(idOrAliasOrEvmAddress)}`,
    );
    return mapAccountDetail(response.data);
  }

  /**
   * List NFTs owned by an account.
   *
   * @example
   * ```ts
   * const page = await client.accounts.getNFTs('0.0.1234').next();
   * for (const nft of page.data) {
   *   console.log(nft.token_id, nft.serial_number);
   * }
   * ```
   */
  getNFTs(idOrAliasOrEvmAddress: string, params?: AccountNftsParams): Paginator<TokenNft> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/accounts/${encodeURIComponent(idOrAliasOrEvmAddress)}/nfts`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('nfts', mapTokenNft),
    });
  }

  /**
   * List token relationships for an account.
   *
   * @example
   * ```ts
   * const page = await client.accounts.getTokens('0.0.1234').next();
   * for (const rel of page.data) {
   *   console.log(rel.token_id, rel.balance);
   * }
   * ```
   */
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

  /**
   * List staking rewards for an account.
   *
   * @example
   * ```ts
   * const page = await client.accounts.getRewards('0.0.1234').next();
   * for (const reward of page.data) {
   *   console.log(reward.timestamp, reward.amount);
   * }
   * ```
   */
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
