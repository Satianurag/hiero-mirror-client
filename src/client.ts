/**
 * MirrorNodeClient — the main entrypoint for the Hiero Mirror Client SDK.
 *
 * ```ts
 * import { MirrorNodeClient } from '@satianurag/hiero-mirror-client';
 *
 * const client = new MirrorNodeClient({ network: 'testnet' });
 * const account = await client.accounts.get('0.0.1234');
 * ```
 *
 * @packageDocumentation
 */

import { HttpClient, type HttpClientOptions, type Logger } from './http/client.js';
import { AccountsResource } from './resources/accounts.js';
import { BalancesResource } from './resources/balances.js';
import { BlocksResource } from './resources/blocks.js';
import { ContractsResource } from './resources/contracts.js';
import { NetworkResource } from './resources/network.js';
import { SchedulesResource } from './resources/schedules.js';
import { TokensResource } from './resources/tokens.js';
import { TopicsResource } from './resources/topics.js';
import { TransactionsResource } from './resources/transactions.js';

// ---------------------------------------------------------------------------
// Network presets
// ---------------------------------------------------------------------------

/**
 * Built-in network presets for the Hedera/Hiero Mirror Node.
 */
export type HieroNetwork = 'mainnet' | 'testnet' | 'previewnet';

const NETWORK_URLS: Record<HieroNetwork, string> = {
  mainnet: 'https://mainnet-public.mirrornode.hedera.com',
  testnet: 'https://testnet.mirrornode.hedera.com',
  previewnet: 'https://previewnet.mirrornode.hedera.com',
};

// ---------------------------------------------------------------------------
// Client options
// ---------------------------------------------------------------------------

export interface MirrorNodeClientOptions {
  /**
   * Network preset. Mutually exclusive with `baseUrl`.
   *
   * If neither `network` nor `baseUrl` is provided, defaults to `'mainnet'`.
   */
  network?: HieroNetwork;

  /**
   * Custom base URL. Mutually exclusive with `network`.
   *
   * Useful for self-hosted mirror nodes or proxies.
   */
  baseUrl?: string;

  /** Request timeout in ms. Default: `30_000`. */
  timeout?: number;

  /** Maximum retry attempts for retryable failures. Default: `2`. */
  maxRetries?: number;

  /** Rate limit in requests per second. Default: `50`. */
  rateLimitRps?: number;

  /** Optional logger. Compatible with `console`, `pino`, `winston`. */
  logger?: Logger;

  /** Custom `fetch` implementation (for testing or environments without global fetch). */
  fetch?: typeof globalThis.fetch;
}

// ---------------------------------------------------------------------------
// Client class
// ---------------------------------------------------------------------------

/**
 * The main Hiero Mirror Client SDK entry point.
 *
 * Provides typed access to all Mirror Node REST API resources with:
 * - Automatic pagination via `Paginator`
 * - Safe JSON parsing for int64 precision
 * - ETag caching, retry/backoff, and rate limiting
 * - Type-safe responses via response mappers
 */
export class MirrorNodeClient {
  // --------------------------------------------------------------------------
  // Resource groups — exposed as readonly properties
  // --------------------------------------------------------------------------

  /** Account operations: list, get, NFTs, tokens, rewards, allowances, airdrops. */
  readonly accounts: AccountsResource;

  /** Global balance queries. */
  readonly balances: BalancesResource;

  /** Block queries. */
  readonly blocks: BlocksResource;

  /** Contract queries and smart contract call simulation. */
  readonly contracts: ContractsResource;

  /** Network info: exchange rate, fees, nodes, stake, supply. */
  readonly network: NetworkResource;

  /** Schedule queries. */
  readonly schedules: SchedulesResource;

  /** Token queries: list, get, balances, NFTs, NFT transactions. */
  readonly tokens: TokensResource;

  /** Topic queries and HCS message streaming. */
  readonly topics: TopicsResource;

  /** Transaction queries. */
  readonly transactions: TransactionsResource;

  /** The underlying HTTP client (exposed for advanced usage). */
  readonly httpClient: HttpClient;

  constructor(options: MirrorNodeClientOptions = {}) {
    // Resolve base URL.
    let baseUrl: string;
    if (options.baseUrl) {
      baseUrl = options.baseUrl;
    } else {
      const network = options.network ?? 'mainnet';
      baseUrl = NETWORK_URLS[network];
    }

    // Build HTTP client options.
    const httpOptions: HttpClientOptions = {
      baseUrl,
      timeout: options.timeout ?? 30_000,
      retry: { maxRetries: options.maxRetries ?? 2 },
      rateLimitRps: options.rateLimitRps ?? 50,
      logger: options.logger,
      fetch: options.fetch,
    };

    this.httpClient = new HttpClient(httpOptions);

    // Initialize resource groups.
    this.accounts = new AccountsResource(this.httpClient);
    this.balances = new BalancesResource(this.httpClient);
    this.blocks = new BlocksResource(this.httpClient);
    this.contracts = new ContractsResource(this.httpClient);
    this.network = new NetworkResource(this.httpClient);
    this.schedules = new SchedulesResource(this.httpClient);
    this.tokens = new TokensResource(this.httpClient);
    this.topics = new TopicsResource(this.httpClient);
    this.transactions = new TransactionsResource(this.httpClient);
  }
}
