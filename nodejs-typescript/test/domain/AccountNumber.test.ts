import { describe, expect, it } from 'vitest';
import { InvalidAccountNumberError } from '../../src/domain/errors.js';
import { AccountNumber } from '../../src/domain/AccountNumber.js';

describe('AccountNumber', () => {
  it('accepts valid 16 digit values and preserves leading zeroes', () => {
    const number = AccountNumber.parse('0001234522226789');
    expect(number.toString()).toBe('0001234522226789');
  });

  it('rejects invalid values', () => {
    expect(() => AccountNumber.parse('123')).toThrow(InvalidAccountNumberError);
    expect(() => AccountNumber.parse('123456789012345678')).toThrow(InvalidAccountNumberError);
    expect(() => AccountNumber.parse('abcd567890123456')).toThrow(InvalidAccountNumberError);
    expect(() => AccountNumber.parse('')).toThrow(InvalidAccountNumberError);
  });
});
