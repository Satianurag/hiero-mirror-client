/**
 * Transactions resource — 3 methods.
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

export interface WaitForTransactionOptions {
  /** Poll interval in ms (default: 1000). */
  interval?: number;
  /** Timeout in ms (default: 30_000). */
  timeout?: number;
  /** AbortSignal for cancellation. */
  signal?: AbortSignal;
}

export class TransactionsResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * List transactions with optional filtering.
   *
   * @example
   * ```ts
   * const page = await client.transactions.list({ limit: 10 }).next();
   * for (const tx of page.data) {
   *   console.log(tx.transaction_id, tx.result);
   * }
   * ```
   */
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

  /**
   * Poll until a transaction appears on the mirror node.
   *
   * Hedera transactions reach consensus in ~3-5s but mirror node ingestion
   * adds 3-7s of lag. This method bridges that gap — analogous to
   * viem's `waitForTransactionReceipt` or ethers' `tx.wait()`.
   *
   * @example
   * ```ts
   * const tx = await client.transactions.waitFor(
   *   '0.0.1234@1615422161.673238162',
   *   { timeout: 15_000 },
   * );
   * console.log(tx.result, tx.consensus_timestamp);
   * ```
   */
  async waitFor(
    transactionId: string,
    options: WaitForTransactionOptions = {},
  ): Promise<Transaction> {
    const interval = options.interval ?? 1000;
    const timeout = options.timeout ?? 30_000;
    const startTime = Date.now();

    while (true) {
      if (options.signal?.aborted) {
        throw new DOMException('The operation was aborted.', 'AbortError');
      }

      try {
        return await this.get(transactionId);
      } catch (error: unknown) {
        // If it's a 404, the transaction hasn't appeared yet — keep polling
        const is404 =
          error !== null &&
          typeof error === 'object' &&
          'statusCode' in error &&
          (error as { statusCode: number }).statusCode === 404;

        if (!is404) {
          throw error;
        }
      }

      // Check timeout
      if (Date.now() - startTime >= timeout) {
        throw new Error(
          `waitFor timed out after ${timeout}ms waiting for transaction ${transactionId}`,
        );
      }

      // Wait before next poll
      await waitForSleep(interval, options.signal);
    }
  }
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function waitForSleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('The operation was aborted.', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('The operation was aborted.', 'AbortError'));
    };

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}
