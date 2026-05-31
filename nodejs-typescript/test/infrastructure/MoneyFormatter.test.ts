import { describe, expect, it } from 'vitest';
import { Money } from '../../src/domain/Money.js';
import { formatMoney } from '../../src/infrastructure/MoneyFormatter.js';

describe('MoneyFormatter', () => {
  it('formats money with exactly two decimal places', () => {
    expect(formatMoney(Money.fromDecimalString('10.5'))).toBe('10.50');
    expect(formatMoney(Money.fromDecimalString('0'))).toBe('0.00');
  });
});
