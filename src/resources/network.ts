/**
 * Network resource — 6 methods.
 * @internal
 */

import type { HttpClient } from '../http/client.js';
import {
  mapExchangeRateSet,
  mapFeeSchedule,
  mapNetworkNode,
  mapNetworkStake,
  mapSupply,
} from '../mappers/network.js';
import { createPageExtractor, Paginator } from '../pagination/paginator.js';
import type {
  ExchangeRateSet,
  FeeSchedule,
  NetworkExchangeRateParams,
  NetworkFeeParams,
  NetworkNode,
  NetworkNodeParams,
  NetworkStake,
  NetworkSupplyParams,
  Supply,
} from '../types/network.js';

export class NetworkResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * Get the current exchange rate.
   *
   * @example
   * ```ts
   * const rate = await client.network.getExchangeRate();
   * console.log(rate.current_rate.cent_equivalent, rate.current_rate.hbar_equivalent);
   * ```
   */
  async getExchangeRate(params?: NetworkExchangeRateParams): Promise<ExchangeRateSet> {
    const response = await this.client.get<unknown>(
      '/api/v1/network/exchangerate',
      params as Record<string, string>,
    );
    return mapExchangeRateSet(response.data);
  }

  /**
   * Get the current fee schedule.
   *
   * @example
   * ```ts
   * const fees = await client.network.getFees();
   * console.log(fees.fees.length, fees.timestamp);
   * ```
   */
  async getFees(params?: NetworkFeeParams): Promise<FeeSchedule> {
    const response = await this.client.get<unknown>(
      '/api/v1/network/fees',
      params as Record<string, string>,
    );
    return mapFeeSchedule(response.data);
  }

  /**
   * POST /api/v1/network/fees — estimate fees from protobuf payload.
   *
   * EC52: Accepts raw Uint8Array (user must serialize protobuf externally).
   */
  async estimateFees(body: Uint8Array): Promise<unknown> {
    const response = await this.client.post<unknown>('/api/v1/network/fees', body, {
      headers: { 'Content-Type': 'application/protobuf' },
    });
    return response.data;
  }

  /**
   * List network nodes.
   *
   * @example
   * ```ts
   * const page = await client.network.getNodes().next();
   * for (const node of page.data) {
   *   console.log(node.node_id, node.description);
   * }
   * ```
   */
  getNodes(params?: NetworkNodeParams): Paginator<NetworkNode> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/network/nodes',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('nodes', mapNetworkNode),
    });
  }

  /**
   * Get network stake information.
   *
   * @example
   * ```ts
   * const stake = await client.network.getStake();
   * console.log(stake.staking_period);
   * ```
   */
  async getStake(): Promise<NetworkStake> {
    const response = await this.client.get<unknown>('/api/v1/network/stake');
    return mapNetworkStake(response.data);
  }

  /**
   * Get the network supply information.
   *
   * @example
   * ```ts
   * const supply = await client.network.getSupply();
   * console.log(supply.total_supply, supply.released_supply);
   * ```
   */
  async getSupply(params?: NetworkSupplyParams): Promise<Supply> {
    const response = await this.client.get<unknown>(
      '/api/v1/network/supply',
      params as Record<string, string>,
    );
    return mapSupply(response.data);
  }
}
