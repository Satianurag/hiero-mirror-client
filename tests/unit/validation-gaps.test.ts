import { describe, expect, it } from 'vitest';
import { HieroNotFoundError } from '../../src/errors/HieroNotFoundError.js';
import { HieroValidationError } from '../../src/errors/HieroValidationError.js';
import { validateBlockNumber } from '../../src/validation/block.js';
import { isValidEntityId } from '../../src/validation/entity-id.js';
import { validateSerialNumber } from '../../src/validation/serial-number.js';
import { HieroTimestamp, isValidTimestamp } from '../../src/validation/timestamp.js';

// ---------------------------------------------------------------------------
// validateBlockNumber — uncovered line 24 (NaN/non-integer)
// ---------------------------------------------------------------------------
describe('validateBlockNumber — NaN branch', () => {
  it('throws on NaN string', () => {
    expect(() => validateBlockNumber('abc')).toThrow('Invalid block number');
  });

  it('throws on negative number', () => {
    expect(() => validateBlockNumber(-1)).toThrow('Invalid block number');
  });
});

// ---------------------------------------------------------------------------
// isValidEntityId — uncovered line 53
// ---------------------------------------------------------------------------
describe('isValidEntityId', () => {
  it('returns true for plain number', () => {
    expect(isValidEntityId(800)).toBe(true);
  });

  it('returns true for shard.realm.num', () => {
    expect(isValidEntityId('0.0.800')).toBe(true);
  });

  it('returns false for invalid', () => {
    expect(isValidEntityId('abc')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidEntityId('')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateSerialNumber — uncovered line 18 (NaN/non-integer)
// ---------------------------------------------------------------------------
describe('validateSerialNumber — NaN branch', () => {
  it('throws on NaN string', () => {
    expect(() => validateSerialNumber('abc')).toThrow('Invalid serial number');
  });

  it('throws on zero serial', () => {
    expect(() => validateSerialNumber(0)).toThrow('Invalid serial number');
  });
});

// ---------------------------------------------------------------------------
// HieroTimestamp — uncovered branches
// ---------------------------------------------------------------------------
describe('HieroTimestamp — uncovered branches', () => {
  it('fromDate throws on negative date', () => {
    expect(() => HieroTimestamp.fromDate(new Date(-1000))).toThrow('Negative timestamps');
  });

  it('isValidTimestamp returns false for invalid format', () => {
    expect(isValidTimestamp('abc')).toBe(false);
    expect(isValidTimestamp('')).toBe(false);
    expect(isValidTimestamp('123.')).toBe(false);
    expect(isValidTimestamp('.123')).toBe(false);
  });

  it('isValidTimestamp returns true for valid format', () => {
    expect(isValidTimestamp('1710000000.000000000')).toBe(true);
    expect(isValidTimestamp('0.0')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Error toJSON coverage — uncovered lines 19 (NotFound) and 23 (Validation)
// ---------------------------------------------------------------------------
describe('Error toJSON methods', () => {
  it('HieroNotFoundError.toJSON includes entityId', () => {
    const error = new HieroNotFoundError('Not found', { entityId: '0.0.999', rawBody: '{}' });
    const json = error.toJSON();
    expect(json.entityId).toBe('0.0.999');
    expect(json.statusCode).toBe(404);
    expect(json.name).toBe('HieroNotFoundError');
  });

  it('HieroValidationError.toJSON includes parameter', () => {
    const error = new HieroValidationError('Invalid param', { parameter: 'limit', rawBody: '{}' });
    const json = error.toJSON();
    expect(json.parameter).toBe('limit');
    expect(json.statusCode).toBe(400);
    expect(json.name).toBe('HieroValidationError');
  });
});
