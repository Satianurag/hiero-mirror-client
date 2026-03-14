import { describe, expect, it } from 'vitest';
import { HieroValidationError } from '../../src/errors/index.js';
import { buildUrl } from '../../src/http/url-builder.js';

const BASE = 'https://testnet.mirrornode.hedera.com';

describe('buildUrl', () => {
  // Basic path construction
  it('builds URL from base and path', () => {
    expect(buildUrl(BASE, '/api/v1/accounts')).toBe(`${BASE}/api/v1/accounts`);
  });

  // EC115: Double-slash collapsing
  it('collapses double slashes (EC115)', () => {
    expect(buildUrl(BASE, '/api//v1///accounts')).toBe(`${BASE}/api/v1/accounts`);
  });

  it('preserves protocol double-slash', () => {
    const url = buildUrl(BASE, '/api/v1/accounts');
    expect(url).toContain('https://');
  });

  // EC154: Null byte stripping
  it('strips null bytes (EC154)', () => {
    expect(buildUrl(BASE, '/api/v1/accounts\0')).toBe(`${BASE}/api/v1/accounts`);
  });

  // EC43: Trailing slash removal
  it('strips trailing slash (EC43)', () => {
    expect(buildUrl(BASE, '/api/v1/accounts/')).toBe(`${BASE}/api/v1/accounts`);
  });

  // EC10: Operator query params
  it('appends operator params (EC10)', () => {
    const url = buildUrl(BASE, '/api/v1/transactions', {
      timestamp: { operator: 'gt', value: '1234.000' },
    });
    expect(url).toContain('timestamp=gt%3A1234.000');
  });

  it('appends multiple operator params', () => {
    const url = buildUrl(BASE, '/api/v1/transactions', {
      timestamp: [
        { operator: 'gt', value: '1000' },
        { operator: 'lt', value: '2000' },
      ],
    });
    expect(url).toContain('timestamp=gt%3A1000');
    expect(url).toContain('timestamp=lt%3A2000');
  });

  // EC42: Scalar params with set semantics
  it('sets scalar params (EC42)', () => {
    const url = buildUrl(BASE, '/api/v1/accounts', { limit: 10 });
    expect(url).toContain('limit=10');
  });

  it('sets boolean params', () => {
    const url = buildUrl(BASE, '/api/v1/accounts', { 'account.balance': true });
    expect(url).toContain('account.balance=true');
  });

  // Query params are passed through as-is (all SDK param types use dot-notation directly)
  it('passes dot-notation params through unchanged', () => {
    const url = buildUrl(BASE, '/api/v1/transactions', { 'sender.id': '0.0.800' });
    expect(url).toContain('sender.id=0.0.800');
  });

  // EC119: Omission of undefined/null/"" values
  it('omits undefined params (EC119)', () => {
    const url = buildUrl(BASE, '/api/v1/accounts', { limit: 10, order: undefined });
    expect(url).toContain('limit=10');
    expect(url).not.toContain('order');
  });

  it('omits null params', () => {
    const url = buildUrl(BASE, '/api/v1/accounts', { limit: 10, order: null });
    expect(url).not.toContain('order');
  });

  it('omits empty string params', () => {
    const url = buildUrl(BASE, '/api/v1/accounts', { limit: 10, order: '' });
    expect(url).not.toContain('order');
  });

  // EC34: URL length validation
  it('throws on URL exceeding 4KB (EC34)', () => {
    const longValue = 'x'.repeat(5000);
    expect(() => buildUrl(BASE, '/api/v1/accounts', { q: longValue })).toThrow(
      HieroValidationError,
    );
  });
});
