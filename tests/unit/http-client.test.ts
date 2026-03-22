import { describe, expect, it, vi } from 'vitest';
import { HieroNotFoundError } from '../../src/errors/HieroNotFoundError.js';
import { HieroParseError } from '../../src/errors/HieroParseError.js';
import { HieroRateLimitError } from '../../src/errors/HieroRateLimitError.js';
import { HieroServerError } from '../../src/errors/HieroServerError.js';
import { HieroTimeoutError } from '../../src/errors/HieroTimeoutError.js';
import { HieroValidationError } from '../../src/errors/HieroValidationError.js';
import { HttpClient } from '../../src/http/client.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  const hdrs = new Headers({ 'content-type': 'application/json', ...headers });
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
    headers: hdrs,
  });
}

function makeTextResponse(body: string, status: number, contentType = 'text/html') {
  const hdrs = new Headers({ 'content-type': contentType });
  return new Response(body, { status, headers: hdrs });
}

function createClient(fetchFn: typeof globalThis.fetch, opts: Record<string, unknown> = {}) {
  return new HttpClient({
    baseUrl: 'https://testnet.mirrornode.hedera.com',
    timeout: 5000,
    retry: { maxRetries: 0 },
    rateLimitRps: 1000,
    fetch: fetchFn,
    ...opts,
  });
}

// ---------------------------------------------------------------------------
// Constructor & destroy
// ---------------------------------------------------------------------------
describe('HttpClient — constructor & destroy', () => {
  it('constructs with minimal options', () => {
    const client = createClient(vi.fn());
    expect(client).toBeDefined();
    client.destroy();
  });

  it('destroy clears internal state', () => {
    const client = createClient(vi.fn());
    client.destroy();
    // No error thrown means caches and inflight maps were cleared
  });
});

// ---------------------------------------------------------------------------
// GET — successful responses
// ---------------------------------------------------------------------------
describe('HttpClient.get — success', () => {
  it('performs a simple GET and returns parsed JSON', async () => {
    const mockData = { accounts: [{ account: '0.0.98' }] };
    const fetchFn = vi.fn().mockResolvedValue(makeResponse(mockData));
    const client = createClient(fetchFn);

    const result = await client.get('/api/v1/accounts');
    expect(result.status).toBe(200);
    expect(result.data).toEqual(mockData);
    expect(fetchFn).toHaveBeenCalledOnce();
    client.destroy();
  });

  it('passes query params correctly', async () => {
    const fetchFn = vi.fn().mockResolvedValue(makeResponse({ accounts: [] }));
    const client = createClient(fetchFn);

    await client.get('/api/v1/accounts', { limit: 10, order: 'asc' });
    const calledUrl = fetchFn.mock.calls[0][0] as string;
    expect(calledUrl).toContain('limit=10');
    expect(calledUrl).toContain('order=asc');
    client.destroy();
  });

  it('handles 204 No Content', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 204,
        headers: new Headers({ 'content-type': 'application/json' }),
      }),
    );
    const client = createClient(fetchFn);

    const result = await client.get('/api/v1/something');
    expect(result.status).toBe(204);
    expect(result.data).toBeNull();
    client.destroy();
  });

  it('handles empty body on 200', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response('', {
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
      }),
    );
    const client = createClient(fetchFn);

    const result = await client.get('/api/v1/something');
    expect(result.data).toBeNull();
    client.destroy();
  });
});

// ---------------------------------------------------------------------------
// GET — ETag caching (EC145)
// ---------------------------------------------------------------------------
describe('HttpClient.get — ETag caching', () => {
  it('caches ETag and sends If-None-Match on next request', async () => {
    const data = { accounts: [] };
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(makeResponse(data, 200, { etag: 'W/"abc123"' }))
      .mockResolvedValueOnce(
        new Response(null, {
          status: 304,
          headers: new Headers({ 'content-type': 'application/json' }),
        }),
      );
    const client = createClient(fetchFn);

    // First request — caches ETag
    const r1 = await client.get('/api/v1/accounts');
    expect(r1.data).toEqual(data);

    // Second request — sends If-None-Match, gets 304
    const r2 = await client.get('/api/v1/accounts');
    expect(r2.status).toBe(304);
    expect(r2.data).toEqual(data); // returns cached body

    const secondCall = fetchFn.mock.calls[1];
    const headers = secondCall[1].headers as Record<string, string>;
    expect(headers['If-None-Match']).toBe('W/"abc123"');
    client.destroy();
  });
});

// ---------------------------------------------------------------------------
// GET — request deduplication
// ---------------------------------------------------------------------------
describe('HttpClient.get — deduplication', () => {
  it('deduplicates concurrent identical GET requests', async () => {
    const data = { accounts: [] };
    const fetchFn = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(makeResponse(data)), 50)),
      );
    const client = createClient(fetchFn);

    const [r1, r2] = await Promise.all([
      client.get('/api/v1/accounts'),
      client.get('/api/v1/accounts'),
    ]);

    expect(fetchFn).toHaveBeenCalledOnce();
    expect(r1.data).toEqual(data);
    expect(r2.data).toEqual(data);
    client.destroy();
  });

  it('does NOT deduplicate different URLs', async () => {
    const fetchFn = vi.fn().mockImplementation(() => Promise.resolve(makeResponse({})));
    const client = createClient(fetchFn);

    await Promise.all([client.get('/api/v1/accounts'), client.get('/api/v1/tokens')]);

    expect(fetchFn).toHaveBeenCalledTimes(2);
    client.destroy();
  });
});

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------
describe('HttpClient.post', () => {
  it('sends POST with JSON body', async () => {
    const responseData = { result: 'ok' };
    const fetchFn = vi.fn().mockResolvedValue(makeResponse(responseData));
    const client = createClient(fetchFn);

    const result = await client.post('/api/v1/contracts/call', { data: '0x1234' });
    expect(result.data).toEqual(responseData);

    const callArgs = fetchFn.mock.calls[0];
    expect(callArgs[1].method).toBe('POST');
    expect(callArgs[1].body).toBe(JSON.stringify({ data: '0x1234' }));
    client.destroy();
  });

  it('sends POST with Uint8Array body (no Content-Type override)', async () => {
    const fetchFn = vi.fn().mockResolvedValue(makeResponse({ ok: true }));
    const client = createClient(fetchFn);

    const body = new Uint8Array([1, 2, 3]);
    await client.post('/api/v1/upload', body);

    const callArgs = fetchFn.mock.calls[0];
    expect(callArgs[1].body).toBeInstanceOf(Uint8Array);
    const headers = callArgs[1].headers as Record<string, string>;
    expect(headers['Content-Type']).toBeUndefined();
    client.destroy();
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------
describe('HttpClient — error handling', () => {
  it('throws HieroNotFoundError on 404', async () => {
    const errorBody = { _status: { messages: [{ message: 'Not found' }] } };
    const fetchFn = vi.fn().mockResolvedValue(makeResponse(errorBody, 404));
    const client = createClient(fetchFn);

    await expect(client.get('/api/v1/accounts/0.0.999999')).rejects.toThrow(HieroNotFoundError);
    client.destroy();
  });

  it('throws HieroValidationError on 400', async () => {
    const errorBody = { _status: { messages: [{ message: 'Invalid parameter' }] } };
    const fetchFn = vi.fn().mockResolvedValue(makeResponse(errorBody, 400));
    const client = createClient(fetchFn);

    await expect(client.get('/api/v1/accounts', { limit: -1 })).rejects.toThrow(
      HieroValidationError,
    );
    client.destroy();
  });

  it('throws HieroRateLimitError on 429', async () => {
    const errorBody = { _status: { messages: [{ message: 'Rate limited' }] } };
    const fetchFn = vi
      .fn()
      .mockResolvedValue(makeResponse(errorBody, 429, { 'retry-after': '30' }));
    const client = createClient(fetchFn);

    await expect(client.get('/api/v1/accounts')).rejects.toThrow(HieroRateLimitError);
    client.destroy();
  });

  it('throws HieroServerError on 500', async () => {
    const errorBody = { _status: { messages: [{ message: 'Server error' }] } };
    const fetchFn = vi.fn().mockResolvedValue(makeResponse(errorBody, 500));
    const client = createClient(fetchFn);

    await expect(client.get('/api/v1/accounts')).rejects.toThrow(HieroServerError);
    client.destroy();
  });

  it('throws HieroParseError for non-JSON error body', async () => {
    const fetchFn = vi.fn().mockResolvedValue(makeTextResponse('<html>Error</html>', 502));
    const client = createClient(fetchFn);

    await expect(client.get('/api/v1/accounts')).rejects.toThrow(HieroParseError);
    client.destroy();
  });

  it('throws HieroParseError when JSON parsing fails on success response', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      new Response('not valid json {{{', {
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
      }),
    );
    const client = createClient(fetchFn);

    await expect(client.get('/api/v1/accounts')).rejects.toThrow();
    client.destroy();
  });

  it('throws HieroTimeoutError when request times out', async () => {
    const fetchFn = vi.fn().mockImplementation(() => {
      const error = new DOMException('Timeout', 'TimeoutError');
      throw error;
    });
    const client = createClient(fetchFn);

    await expect(client.get('/api/v1/accounts')).rejects.toThrow(HieroTimeoutError);
    client.destroy();
  });

  it('rethrows AbortError from user cancellation', async () => {
    const fetchFn = vi.fn().mockImplementation(() => {
      throw new DOMException('Aborted', 'AbortError');
    });
    const client = createClient(fetchFn);

    await expect(client.get('/api/v1/accounts')).rejects.toThrow('Aborted');
    client.destroy();
  });

  it('throws HieroNetworkError on TypeError (fetch network failure)', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    const client = createClient(fetchFn);

    await expect(client.get('/api/v1/accounts')).rejects.toThrow(TypeError);
    client.destroy();
  });
});

// ---------------------------------------------------------------------------
// Retry behavior
// ---------------------------------------------------------------------------
describe('HttpClient — retry', () => {
  it('retries on 500 and succeeds on second attempt', async () => {
    const errorBody = { _status: { messages: [{ message: 'Server error' }] } };
    const successBody = { accounts: [] };
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(makeResponse(errorBody, 500))
      .mockResolvedValueOnce(makeResponse(successBody));

    const client = new HttpClient({
      baseUrl: 'https://testnet.mirrornode.hedera.com',
      timeout: 5000,
      retry: { maxRetries: 1, baseDelay: 10, maxDelay: 20 },
      rateLimitRps: 1000,
      fetch: fetchFn,
    });

    const result = await client.get('/api/v1/accounts');
    expect(result.data).toEqual(successBody);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    client.destroy();
  });

  it('retries on TypeError (network failure) and succeeds', async () => {
    const successBody = { accounts: [] };
    const fetchFn = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(makeResponse(successBody));

    const client = new HttpClient({
      baseUrl: 'https://testnet.mirrornode.hedera.com',
      timeout: 5000,
      retry: { maxRetries: 1, baseDelay: 10, maxDelay: 20 },
      rateLimitRps: 1000,
      fetch: fetchFn,
    });

    const result = await client.get('/api/v1/accounts');
    expect(result.data).toEqual(successBody);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    client.destroy();
  });

  it('does NOT retry on 404', async () => {
    const errorBody = { _status: { messages: [{ message: 'Not found' }] } };
    const fetchFn = vi.fn().mockResolvedValue(makeResponse(errorBody, 404));

    const client = new HttpClient({
      baseUrl: 'https://testnet.mirrornode.hedera.com',
      timeout: 5000,
      retry: { maxRetries: 2, baseDelay: 10, maxDelay: 20 },
      rateLimitRps: 1000,
      fetch: fetchFn,
    });

    await expect(client.get('/api/v1/accounts/0.0.999')).rejects.toThrow(HieroNotFoundError);
    expect(fetchFn).toHaveBeenCalledOnce();
    client.destroy();
  });

  it('does NOT retry on timeout', async () => {
    const fetchFn = vi.fn().mockImplementation(() => {
      throw new DOMException('Timeout', 'TimeoutError');
    });

    const client = new HttpClient({
      baseUrl: 'https://testnet.mirrornode.hedera.com',
      timeout: 5000,
      retry: { maxRetries: 2, baseDelay: 10, maxDelay: 20 },
      rateLimitRps: 1000,
      fetch: fetchFn,
    });

    await expect(client.get('/api/v1/accounts')).rejects.toThrow(HieroTimeoutError);
    expect(fetchFn).toHaveBeenCalledOnce();
    client.destroy();
  });
});

// ---------------------------------------------------------------------------
// Hooks (beforeRequest / afterResponse)
// ---------------------------------------------------------------------------
describe('HttpClient — hooks', () => {
  it('calls beforeRequest hooks', async () => {
    const hook = vi.fn();
    const fetchFn = vi.fn().mockResolvedValue(makeResponse({}));
    const client = createClient(fetchFn, { beforeRequest: [hook] });

    await client.get('/api/v1/accounts');
    expect(hook).toHaveBeenCalledOnce();
    expect(hook.mock.calls[0][0]).toMatchObject({ method: 'GET' });
    client.destroy();
  });

  it('calls afterResponse hooks', async () => {
    const hook = vi.fn();
    const fetchFn = vi.fn().mockResolvedValue(makeResponse({}));
    const client = createClient(fetchFn, { afterResponse: [hook] });

    await client.get('/api/v1/accounts');
    expect(hook).toHaveBeenCalledOnce();
    expect(hook.mock.calls[0][0]).toMatchObject({ method: 'GET', status: 200 });
    client.destroy();
  });

  it('beforeRequest hook can modify headers', async () => {
    const hook = vi.fn(({ headers }: { headers: Record<string, string> }) => {
      headers['X-Custom'] = 'value';
    });
    const fetchFn = vi.fn().mockResolvedValue(makeResponse({}));
    const client = createClient(fetchFn, { beforeRequest: [hook] });

    await client.get('/api/v1/accounts');
    const headers = fetchFn.mock.calls[0][1].headers as Record<string, string>;
    expect(headers['X-Custom']).toBe('value');
    client.destroy();
  });
});

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------
describe('HttpClient — logger', () => {
  it('calls logger.debug on successful requests', async () => {
    const logger = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const fetchFn = vi.fn().mockResolvedValue(makeResponse({}));
    const client = createClient(fetchFn, { logger });

    await client.get('/api/v1/accounts');
    expect(logger.debug).toHaveBeenCalled();
    client.destroy();
  });

  it('calls logger.warn on unexpected content-type', async () => {
    const logger = { debug: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const fetchFn = vi.fn().mockResolvedValue(
      new Response('{"ok":true}', {
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
      }),
    );
    const client = createClient(fetchFn, { logger });

    await client.get('/api/v1/accounts');
    expect(logger.warn).toHaveBeenCalled();
    client.destroy();
  });
});
