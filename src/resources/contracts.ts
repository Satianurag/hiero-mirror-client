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
} from '../mappers/contract.js';
import { Paginator, createPageExtractor } from '../pagination/paginator.js';
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

function mapStateChange(raw: unknown): StateChange {
  const r = asRecord(raw);
  return {
    address: strReq(r, 'address'),
    contract_id: strReq(r, 'contract_id'),
    slot: strReq(r, 'slot'),
    value_read: strReq(r, 'value_read'),
    value_written: r.value_written == null ? null : strReq(r, 'value_written'),
  };
}

export class ContractsResource {
  constructor(private readonly client: HttpClient) {}

  list(params?: ContractListParams): Paginator<ContractSummary> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/contracts',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('contracts', mapContractSummary),
    });
  }

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

  async getOpcodes(transactionIdOrHash: string): Promise<OpcodeResponse> {
    const response = await this.client.get<unknown>(
      `/api/v1/contracts/results/${encodeURIComponent(transactionIdOrHash)}/opcodes`,
    );
    return response.data as OpcodeResponse;
  }
}

/**
 * Response from the opcodes endpoint.
 */
export interface OpcodeResponse {
  /** Array of opcode entries for the transaction. */
  opcodes: OpcodeEntry[];
}

export interface OpcodeEntry {
  /** Program counter position. */
  pc: number;
  /** EVM opcode name (e.g., "PUSH1", "SSTORE"). */
  op: string;
  /** Gas remaining at this step. */
  gas: number;
  /** Gas cost of this opcode. */
  gasCost: number;
  /** Stack depth. */
  depth: number;
  /** Stack contents (hex strings). */
  stack?: string[];
  /** Memory contents (hex strings). */
  memory?: string[];
  /** Storage changes. */
  storage?: Record<string, string>;
  /** Reason string if the opcode reverted. */
  reason?: string;
}
