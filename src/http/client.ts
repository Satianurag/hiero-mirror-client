/**
 * Core HTTP client for the Hiero Mirror Node SDK.
 *
 * Wraps `fetch` with:
 * - Timeout via `AbortController`
 * - Safe JSON parsing (int64 precision)
 * - Error factory integration
 * - Rate limiting
 * - Request deduplication
 * - Retry with exponential backoff
 * - ETag/conditional request support (stubbed for Step 11)
 *
 * @internal
 */

import { HieroNetworkError } from '../errors/HieroNetworkError.js';
import { HieroTimeoutError } from '../errors/HieroTimeoutError.js';
import { createErrorFromResponse, createParseError } from '../errors/factory.js';
import { ETagCache, type ETagCacheOptions } from './etag-cache.js';
import { safeJsonParse } from './json-parser.js';
import { RateLimiter } from './rate-limiter.js';
import {
  DEFAULT_RETRY_OPTIONS,
  type RetryOptions,
  computeRetryDelay,
  isRetryableError,
  isRetryableStatus,
  sleep,
} from './retry.js';
import { type QueryParams, buildUrl } from './url-builder.js';

/**
 * Logger re-exported from types for internal use.
 */
export type { Logger } from '../types/common.js';
import type { Logger } from '../types/common.js';

export interface HttpClientOptions {
  /** Base URL for the mirror node. */
  baseUrl: string;
  /** Request timeout in milliseconds. Default: 30000. */
  timeout?: number;
  /** Retry options. */
  retry?: Partial<RetryOptions>;
  /** Rate limit in requests per second. Default: 50. */
  rateLimitRps?: number;
  /** ETag cache options. */
  etagCache?: ETagCacheOptions;
  /** Optional logger for debug output. */
  logger?: Logger;
  /** Custom fetch implementation (for testing). */
  fetch?: typeof globalThis.fetch;
}

export interface RequestOptions {
  /** Additional headers to send. */
  headers?: Record<string, string>;
  /** Override the default timeout for this request. */
  timeout?: number;
  /** Abort signal for request cancellation. */
  signal?: AbortSignal;
}

export interface HttpResponse<T = unknown> {
  /** Parsed response body. */
  data: T;
  /** HTTP status code. */
  status: number;
  /** Response headers. */
  headers: Headers;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retryOptions: RetryOptions;
  private readonly rateLimiter: RateLimiter;
  private readonly inflight = new Map<string, Promise<HttpResponse<unknown>>>();
  private readonly etagCache: ETagCache;
  private readonly logger: Logger;
  private readonly fetchFn: typeof globalThis.fetch;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.timeout = options.timeout ?? 30_000;
    this.retryOptions = { ...DEFAULT_RETRY_OPTIONS, ...options.retry };
    this.rateLimiter = new RateLimiter(options.rateLimitRps ?? 50);
    this.etagCache = new ETagCache(options.etagCache);
    this.logger = options.logger ?? {};
    this.fetchFn = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  /**
   * Performs a GET request with in-flight deduplication.
   *
   * @param path - API path (e.g., `/api/v1/accounts`)
   * @param params - Optional query parameters
   * @param options - Optional request options
   * @returns Parsed response
   */
  async get<T = unknown>(
    path: string,
    params?: QueryParams,
    options?: RequestOptions,
  ): Promise<HttpResponse<T>> {
    const url = buildUrl(this.baseUrl, path, params);

    // Dedup: if an identical GET is already in-flight, return same promise
    const existing = this.inflight.get(url);
    if (existing) {
      return existing as Promise<HttpResponse<T>>;
    }

    // EC145: Inject If-None-Match header for ETag-based conditional requests
    const cachedETag = this.etagCache.getETag(url);
    const mergedOptions: RequestOptions = cachedETag
      ? {
          ...options,
          headers: { ...options?.headers, 'If-None-Match': cachedETag },
        }
      : (options ?? {});

    const promise = this.request<T>('GET', url, undefined, mergedOptions);
    this.inflight.set(url, promise as Promise<HttpResponse<unknown>>);

    try {
      return await promise;
    } finally {
      this.inflight.delete(url);
    }
  }

  /**
   * Performs a POST request.
   *
   * POST requests are NOT deduplicated (they have side effects).
   *
   * @param path - API path
   * @param body - Request body (will be JSON-serialized)
   * @param options - Optional request options
   * @returns Parsed response
   */
  async post<T = unknown>(
    path: string,
    body: unknown,
    options?: RequestOptions,
  ): Promise<HttpResponse<T>> {
    const url = buildUrl(this.baseUrl, path);
    return this.request<T>('POST', url, body, options);
  }

  /**
   * Core request method with retry, rate limiting, timeout, and error handling.
   */
  private async request<T>(
    method: string,
    url: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<HttpResponse<T>> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.retryOptions.maxRetries; attempt++) {
      try {
        // Rate limiting
        await this.rateLimiter.acquire(options?.signal);

        // Compose abort signal: user signal + timeout (native, no timer leaks)
        const timeoutMs = options?.timeout ?? this.timeout;
        const signals: AbortSignal[] = [AbortSignal.timeout(timeoutMs)];
        if (options?.signal) {
          signals.push(options.signal);
        }
        const composedSignal = AbortSignal.any(signals);

        try {
          const headers: Record<string, string> = {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip',
            ...options?.headers,
          };

          if (body !== undefined) {
            headers['Content-Type'] = 'application/json';
          }

          this.logger.debug?.(`[HTTP] ${method} ${url}`, { attempt });

          const response = await this.fetchFn(url, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal: composedSignal,
          });

          return await this.handleResponse<T>(response, url, attempt);
        } catch (error) {
          // Check if this was a timeout (AbortSignal.timeout fires TimeoutError)
          if (error instanceof DOMException && error.name === 'TimeoutError') {
            throw new HieroTimeoutError(timeoutMs);
          }

          // Check if this was a user abort
          if (
            error instanceof DOMException &&
            error.name === 'AbortError' &&
            options?.signal?.aborted
          ) {
            throw error;
          }

          throw error;
        }
      } catch (error) {
        lastError = error;

        // Don't retry on timeout, validation, or user abort
        if (error instanceof HieroTimeoutError) throw error;
        if (options?.signal?.aborted) throw error;

        // Check if the error is retryable
        const isRetryable =
          isRetryableError(error) ||
          (error !== null &&
            typeof error === 'object' &&
            'statusCode' in error &&
            isRetryableStatus((error as { statusCode: number }).statusCode));

        if (!isRetryable || attempt >= this.retryOptions.maxRetries) {
          throw error;
        }

        // Compute retry delay
        const retryAfter =
          error !== null && typeof error === 'object' && 'retryAfter' in error
            ? (error as { retryAfter?: number }).retryAfter
            : undefined;

        const delay = computeRetryDelay(attempt, this.retryOptions, retryAfter);
        this.logger.warn?.(
          `[HTTP] Retry ${attempt + 1}/${this.retryOptions.maxRetries} after ${Math.round(delay)}ms`,
          {
            url,
          },
        );

        await sleep(delay, options?.signal);
      }
    }

    // Should not reach here, but just in case
    if (lastError instanceof Error) throw lastError;
    throw new HieroNetworkError('Request failed after all retries');
  }

  /**
   * Handles the HTTP response: checks content type, parses JSON safely,
   * and throws appropriate errors for non-2xx responses.
   */
  private async handleResponse<T>(
    response: Response,
    url: string,
    _attempt: number,
  ): Promise<HttpResponse<T>> {
    // EC145: 304 Not Modified — return cached body immediately.
    // Skip response.text() entirely since the 304 body is empty/irrelevant.
    if (response.status === 304) {
      const cachedBody = this.etagCache.getCachedBody(url);
      this.logger.debug?.(`[HTTP] 304 Not Modified — returning cached body for ${url}`);
      return {
        data: (cachedBody ?? null) as T,
        status: 304,
        headers: response.headers,
      };
    }

    // 204 No Content — no body to read.
    if (response.status === 204) {
      return {
        data: null as T,
        status: 204,
        headers: response.headers,
      };
    }

    // We MUST use response.text() + safeJsonParse() (not response.json()) because
    // we need a custom reviver to preserve int64 precision (TC39 context.source).
    const rawBody = await response.text();

    // Check Content-Type before parsing (EC153)
    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json') || contentType.includes('text/json');

    if (!response.ok) {
      // Try to parse error body as JSON (using safeJsonParse for consistency)
      let parsedBody: unknown = null;
      if (isJson && rawBody) {
        try {
          parsedBody = safeJsonParse(rawBody);
        } catch {
          // Non-JSON error response (EC153: text/html)
        }
      }

      if (parsedBody) {
        const error = createErrorFromResponse(
          response.status,
          parsedBody,
          rawBody,
          response.headers,
        );
        throw error;
      }

      // Non-JSON error body
      throw createParseError(rawBody, response.status);
    }

    // Empty body on other success statuses
    if (!rawBody) {
      return {
        data: null as T,
        status: response.status,
        headers: response.headers,
      };
    }

    // Parse successful JSON response with safe parser
    if (!isJson) {
      this.logger.warn?.(`[HTTP] Unexpected content-type "${contentType}" for ${url}`);
    }

    try {
      const data = safeJsonParse(rawBody) as T;

      // EC145: Cache ETag from response for future conditional requests
      const etag = response.headers.get('etag');
      if (etag) {
        this.etagCache.set(url, etag, data);
      }

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (cause) {
      throw createParseError(rawBody, response.status, cause);
    }
  }
}
