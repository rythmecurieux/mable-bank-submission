import { describe, expect, it } from 'vitest';
import { AccountBalance } from '../../src/domain/AccountBalance.js';
import { AccountNumber } from '../../src/domain/AccountNumber.js';
import { Money } from '../../src/domain/Money.js';

describe('AccountBalance', () => {
  it('exposes account number and balance', () => {
    const snapshot = new AccountBalance(
      AccountNumber.parse('1111234522226789'),
      Money.fromDecimalString('500.00'),
    );

    expect(snapshot.accountNumber.toString()).toBe('1111234522226789');
    expect(snapshot.balance.format()).toBe('500.00');
  });
});
