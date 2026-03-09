import { describe, expect, it } from 'vitest';
import {
  HieroCapabilityError,
  HieroError,
  HieroNetworkError,
  HieroNotFoundError,
  HieroParseError,
  HieroRateLimitError,
  HieroServerError,
  HieroTimeoutError,
  HieroValidationError,
  createErrorFromResponse,
  createParseError,
} from '../../src/errors/index.js';

// ---------------------------------------------------------------------------
// Base class behavior
// ---------------------------------------------------------------------------
describe('HieroError', () => {
  it('stores message and statusCode', () => {
    const err = new HieroError('something broke', { statusCode: 500 });
    expect(err.message).toBe('something broke');
    expect(err.statusCode).toBe(500);
    expect(err.name).toBe('HieroError');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(HieroError);
  });

  it('serializes to JSON', () => {
    const err = new HieroError('fail', { statusCode: 400 });
    const json = err.toJSON();
    expect(json).toEqual({ name: 'HieroError', message: 'fail', statusCode: 400 });
  });

  it('supports cause option', () => {
    const cause = new Error('root');
    const err = new HieroError('wrapper', { cause });
    expect(err.cause).toBe(cause);
  });
});

// ---------------------------------------------------------------------------
// Subclass instanceof checks
// ---------------------------------------------------------------------------
describe('Error hierarchy - instanceof', () => {
  const cases: Array<[string, HieroError]> = [
    ['HieroNetworkError', new HieroNetworkError('dns fail')],
    ['HieroTimeoutError', new HieroTimeoutError(30000)],
    ['HieroRateLimitError', new HieroRateLimitError('rate limited')],
    ['HieroNotFoundError', new HieroNotFoundError('not found')],
    ['HieroValidationError', new HieroValidationError('bad param')],
    ['HieroServerError', new HieroServerError('internal error')],
    ['HieroParseError', new HieroParseError('parse fail', { body: '<html>' })],
    ['HieroCapabilityError', new HieroCapabilityError('disabled', { feature: 'stateproof' })],
  ];

  for (const [name, err] of cases) {
    it(`${name} is instanceof HieroError`, () => {
      expect(err).toBeInstanceOf(HieroError);
      expect(err).toBeInstanceOf(Error);
    });

    it(`${name} has correct name`, () => {
      expect(err.name).toBe(name);
    });
  }
});

// ---------------------------------------------------------------------------
// Subclass-specific properties
// ---------------------------------------------------------------------------
describe('HieroTimeoutError', () => {
  it('includes timeout duration', () => {
    const err = new HieroTimeoutError(5000);
    expect(err.timeoutMs).toBe(5000);
    expect(err.message).toBe('Request timed out after 5000ms');
  });
});

describe('HieroRateLimitError', () => {
  it('has statusCode 429 and retryAfter', () => {
    const err = new HieroRateLimitError('too many requests', { retryAfter: 60 });
    expect(err.statusCode).toBe(429);
    expect(err.retryAfter).toBe(60);
    expect(err.toJSON()).toEqual({
      name: 'HieroRateLimitError',
      message: 'too many requests',
      statusCode: 429,
      retryAfter: 60,
    });
  });
});

describe('HieroNotFoundError', () => {
  it('has statusCode 404 and entityId', () => {
    const err = new HieroNotFoundError('Not found', { entityId: '0.0.999' });
    expect(err.statusCode).toBe(404);
    expect(err.entityId).toBe('0.0.999');
  });
});

describe('HieroValidationError', () => {
  it('has default statusCode 400 and parameter', () => {
    const err = new HieroValidationError('Invalid parameter: limit', { parameter: 'limit' });
    expect(err.statusCode).toBe(400);
    expect(err.parameter).toBe('limit');
  });

  it('supports custom statusCode (415)', () => {
    const err = new HieroValidationError('Unsupported Media Type', { statusCode: 415 });
    expect(err.statusCode).toBe(415);
  });
});

describe('HieroCapabilityError', () => {
  it('has feature name and statusCode 404', () => {
    const err = new HieroCapabilityError('Feature disabled', { feature: 'stateproof' });
    expect(err.statusCode).toBe(404);
    expect(err.feature).toBe('stateproof');
    expect(err.toJSON()).toEqual({
      name: 'HieroCapabilityError',
      message: 'Feature disabled',
      statusCode: 404,
      feature: 'stateproof',
    });
  });
});

describe('HieroParseError', () => {
  it('stores the raw body', () => {
    const err = new HieroParseError('parse failure', { body: '<html>error</html>' });
    expect(err.body).toBe('<html>error</html>');
  });
});

// ---------------------------------------------------------------------------
// Error factory
// ---------------------------------------------------------------------------
describe('createErrorFromResponse', () => {
  // EC5: Mirror Node custom error shape
  it('parses _status.messages[0].message from 400', () => {
    const body = { _status: { messages: [{ message: 'Invalid parameter: limit' }] } };
    const err = createErrorFromResponse(400, body, JSON.stringify(body));
    expect(err).toBeInstanceOf(HieroValidationError);
    expect(err.message).toBe('Invalid parameter: limit');
    expect((err as HieroValidationError).parameter).toBe('limit');
  });

  it('parses message + detail from 404', () => {
    const body = {
      _status: { messages: [{ message: 'Not Found', detail: 'File 0.0.112 not found' }] },
    };
    const err = createErrorFromResponse(404, body, JSON.stringify(body));
    expect(err).toBeInstanceOf(HieroNotFoundError);
    expect(err.message).toBe('Not Found: File 0.0.112 not found');
  });

  // EC52: 415 → HieroValidationError
  it('maps 415 to HieroValidationError', () => {
    const body = { _status: { messages: [{ message: 'Unsupported Media Type' }] } };
    const err = createErrorFromResponse(415, body, JSON.stringify(body));
    expect(err).toBeInstanceOf(HieroValidationError);
    expect(err.statusCode).toBe(415);
  });

  it('maps 429 to HieroRateLimitError', () => {
    const body = { _status: { messages: [{ message: 'Too Many Requests' }] } };
    const headers = new Headers({ 'retry-after': '30' });
    const err = createErrorFromResponse(429, body, JSON.stringify(body), headers);
    expect(err).toBeInstanceOf(HieroRateLimitError);
    expect((err as HieroRateLimitError).retryAfter).toBe(30);
  });

  it('maps 500 to HieroServerError', () => {
    const body = { _status: { messages: [{ message: 'Internal Server Error' }] } };
    const err = createErrorFromResponse(500, body, JSON.stringify(body));
    expect(err).toBeInstanceOf(HieroServerError);
    expect(err.statusCode).toBe(500);
  });

  it('maps 502 to HieroServerError', () => {
    const err = createErrorFromResponse(502, {}, '{}');
    expect(err).toBeInstanceOf(HieroServerError);
    expect(err.statusCode).toBe(502);
  });

  it('falls back to HieroError for unknown status codes', () => {
    const err = createErrorFromResponse(418, {}, '{}');
    expect(err).toBeInstanceOf(HieroError);
    expect(err).not.toBeInstanceOf(HieroValidationError);
    expect(err.statusCode).toBe(418);
  });

  it('handles empty body gracefully', () => {
    const err = createErrorFromResponse(400, null, '');
    expect(err).toBeInstanceOf(HieroValidationError);
    expect(err.message).toBe('Unknown error');
  });

  it('handles missing _status gracefully', () => {
    const err = createErrorFromResponse(500, { error: 'something' }, '{"error":"something"}');
    expect(err).toBeInstanceOf(HieroServerError);
    expect(err.message).toBe('Unknown error');
  });
});

describe('createParseError', () => {
  // EC153: Unicode params return text/html
  it('creates HieroParseError from non-JSON body', () => {
    const err = createParseError('<html>Bad Request</html>', 400);
    expect(err).toBeInstanceOf(HieroParseError);
    expect(err).toBeInstanceOf(HieroError);
    expect(err.body).toBe('<html>Bad Request</html>');
    expect(err.statusCode).toBe(400);
  });
});
