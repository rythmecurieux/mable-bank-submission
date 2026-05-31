import { describe, expect, it } from 'vitest';
import { InvalidMoneyError } from '../../src/domain/errors.js';
import { Money } from '../../src/domain/Money.js';

describe('Money', () => {
  it('parses decimal strings into bigint cents', () => {
    expect(Money.fromDecimalString('10.50').format()).toBe('10.50');
    expect(Money.fromDecimalString('25').format()).toBe('25.00');
  });

  it('adds and subtracts without floating-point drift', () => {
    const left = Money.fromDecimalString('0.10');
    const right = Money.fromDecimalString('0.20');
    expect(left.add(right).format()).toBe('0.30');
    expect(
      Money.fromDecimalString('10.00').subtract(Money.fromDecimalString('3.25')).format(),
    ).toBe('6.75');
  });

  it('compares values', () => {
    expect(Money.fromDecimalString('1.00').compare(Money.fromDecimalString('2.00'))).toBe(-1);
  });

  it('rejects malformed, blank, and over-scaled values', () => {
    expect(() => Money.fromDecimalString('abc')).toThrow(InvalidMoneyError);
    expect(() => Money.fromDecimalString('   ')).toThrow(InvalidMoneyError);
    expect(() => Money.fromDecimalString('1.234')).toThrow(/2 decimal places/);
  });

  it('rejects negative amounts at parse time', () => {
    expect(() => Money.fromDecimalString('-1.00')).toThrow(InvalidMoneyError);
    expect(() => Money.fromDecimalString('-0.01')).toThrow(/negative/);
  });

  it('parses very large amounts without Number precision loss', () => {
    const large = Money.fromDecimalString('999999999999999999.99');
    expect(large.format()).toBe('999999999999999999.99');
  });

  it('supports bigint-scale addition', () => {
    const a = Money.fromDecimalString('1000000000000000000.00');
    const b = Money.fromDecimalString('0.01');
    expect(a.add(b).format()).toBe('1000000000000000000.01');
  });

  it('formats negative cents from fromCents for reconciliation edge cases', () => {
    expect(Money.fromCents(-199n).format()).toBe('-1.99');
  });
});
