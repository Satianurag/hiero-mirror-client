/**
 * Transactions resource — 2 methods.
 *
 * EC21/150/151: `.get()` unwraps `{ transactions: [...] }` envelope.
 *
 * @internal
 */

import type { HttpClient } from '../http/client.js';
import { mapTransaction, unwrapTransaction } from '../mappers/transaction.js';
import { createPageExtractor, Paginator } from '../pagination/paginator.js';
import type {
  Transaction,
  TransactionGetParams,
  TransactionListParams,
} from '../types/transactions.js';

export class TransactionsResource {
  constructor(private readonly client: HttpClient) {}

  list(params?: TransactionListParams): Paginator<Transaction> {
    return new Paginator({
      client: this.client,
      path: '/api/v1/transactions',
      params: params as Record<string, unknown>,
      extract: createPageExtractor('transactions', mapTransaction),
    });
  }

  /**
   * Get a transaction by ID.
   *
   * EC21/150/151: The API returns `{ transactions: [{ ... }] }`.
   * This method unwraps to return the single transaction.
   */
  async get(transactionId: string, params?: TransactionGetParams): Promise<Transaction> {
    const response = await this.client.get<unknown>(
      `/api/v1/transactions/${encodeURIComponent(transactionId)}`,
      params as Record<string, string>,
    );
    return unwrapTransaction(response.data);
  }
}
