/**
 * Contracts resource — 12 methods.
 * @internal
 */

import type { HttpClient } from '../http/client.js';
import { asRecord, strReq } from '../mappers/common.js';
import {
  mapContractAction,
  mapContractDetail,
  mapContractLog,
  mapContractResult,
  mapContractSummary,
  mapStateChange,
} from '../mappers/contract.js';
import { createPageExtractor, Paginator } from '../pagination/paginator.js';
import type {
  ContractAction,
  ContractCallRequest,
  ContractCallResponse,
  ContractDetail,
  ContractListParams,
  ContractLog,
  ContractLogsParams,
  ContractResult,
  ContractResultsParams,
  ContractStateParams,
  ContractSummary,
  StateChange,
} from '../types/contracts.js';

export class ContractsResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * List contracts with optional filtering.
   *
   * @example
   * ```ts
   * const page = await client.contracts.list({ limit: 10 }).next();
   * for (const contract of page.data) {
   *   console.log(contract.contract_id, contract.evm_address);
   * }
   * ```
   */
  list(params?: ContractListParams): Paginator<ContractSummary> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/contracts',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('contracts', mapContractSummary),
    });
  }

  /**
   * Get detailed contract information by ID or EVM address.
   *
   * @example
   * ```ts
   * const contract = await client.contracts.get('0.0.1234');
   * console.log(contract.contract_id, contract.bytecode);
   * ```
   */
  async get(contractIdOrAddress: string): Promise<ContractDetail> {
    const response = await this.client.get<unknown>(
      `/api/v1/contracts/${encodeURIComponent(contractIdOrAddress)}`,
    );
    return mapContractDetail(response.data);
  }

  /**
   * POST /api/v1/contracts/call — smart contract read-only simulation.
   *
   * EC29/51/130-133.
   */
  async call(request: ContractCallRequest): Promise<ContractCallResponse> {
    const response = await this.client.post<unknown>('/api/v1/contracts/call', request);
    const r = asRecord(response.data);
    return { result: strReq(r, 'result') };
  }

  /**
   * List contract results across all contracts.
   *
   * @example
   * ```ts
   * const page = await client.contracts.getResults().next();
   * for (const result of page.data) {
   *   console.log(result.contract_id, result.function_parameters);
   * }
   * ```
   */
  getResults(params?: ContractResultsParams): Paginator<ContractResult> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/contracts/results',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('results', mapContractResult),
    });
  }

  getResultsByContract(
    contractIdOrAddress: string,
    params?: ContractResultsParams,
  ): Paginator<ContractResult> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/contracts/${encodeURIComponent(contractIdOrAddress)}/results`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('results', mapContractResult),
    });
  }

  async getResultByTimestamp(
    contractIdOrAddress: string,
    timestamp: string,
  ): Promise<ContractResult> {
    const response = await this.client.get<unknown>(
      `/api/v1/contracts/${encodeURIComponent(contractIdOrAddress)}/results/${encodeURIComponent(timestamp)}`,
    );
    return mapContractResult(response.data);
  }

  async getResultByTransactionIdOrHash(transactionIdOrHash: string): Promise<ContractResult> {
    const response = await this.client.get<unknown>(
      `/api/v1/contracts/results/${encodeURIComponent(transactionIdOrHash)}`,
    );
    return mapContractResult(response.data);
  }

  getActions(transactionIdOrHash: string): Paginator<ContractAction> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/contracts/results/${encodeURIComponent(transactionIdOrHash)}/actions`,
      extract: createPageExtractor('actions', mapContractAction),
    });
  }

  /**
   * List contract logs across all contracts.
   *
   * @example
   * ```ts
   * const page = await client.contracts.getLogs().next();
   * for (const log of page.data) {
   *   console.log(log.contract_id, log.data);
   * }
   * ```
   */
  getLogs(params?: ContractLogsParams): Paginator<ContractLog> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/contracts/results/logs',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('logs', mapContractLog),
    });
  }

  getLogsByContract(
    contractIdOrAddress: string,
    params?: ContractLogsParams,
  ): Paginator<ContractLog> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/contracts/${encodeURIComponent(contractIdOrAddress)}/results/logs`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('logs', mapContractLog),
    });
  }

  getState(contractIdOrAddress: string, params?: ContractStateParams): Paginator<StateChange> {
    return new Paginator({
      client: this.client,
      path: `/api/v1/contracts/${encodeURIComponent(contractIdOrAddress)}/state`,
      params: params as Record<string, unknown>,
      extract: createPageExtractor('state', mapStateChange),
    });
  }

  async getOpcodes(transactionIdOrHash: string): Promise<unknown> {
    const response = await this.client.get<unknown>(
      `/api/v1/contracts/results/${encodeURIComponent(transactionIdOrHash)}/opcodes`,
    );
    return response.data;
  }
}
