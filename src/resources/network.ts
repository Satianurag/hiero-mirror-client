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
import { Paginator, createPageExtractor } from '../pagination/paginator.js';
import type {
  ExchangeRateSet,
  FeeSchedule,
  NetworkFeeParams,
  NetworkNode,
  NetworkNodeParams,
  NetworkStake,
  NetworkSupplyParams,
  Supply,
} from '../types/network.js';

export class NetworkResource {
  constructor(private readonly client: HttpClient) {}

  async getExchangeRate(): Promise<ExchangeRateSet> {
    const response = await this.client.get<unknown>('/api/v1/network/exchangerate');
    return mapExchangeRateSet(response.data);
  }

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

  getNodes(params?: NetworkNodeParams): Paginator<NetworkNode> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/network/nodes',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('nodes', mapNetworkNode),
    });
  }

  async getStake(): Promise<NetworkStake> {
    const response = await this.client.get<unknown>('/api/v1/network/stake');
    return mapNetworkStake(response.data);
  }

  async getSupply(params?: NetworkSupplyParams): Promise<Supply> {
    const response = await this.client.get<unknown>(
      '/api/v1/network/supply',
      params as Record<string, string>,
    );
    return mapSupply(response.data);
  }
}
