import { describe, expect, it } from 'vitest';
import { Account } from '../../src/domain/Account.js';
import { AccountNumber } from '../../src/domain/AccountNumber.js';
import { InsufficientFundsError } from '../../src/domain/errors.js';
import { Money } from '../../src/domain/Money.js';

describe('Account', () => {
  const accountNumber = AccountNumber.parse('1111234522226789');

  it('credits and debits when funds are available', () => {
    const account = new Account(accountNumber, Money.fromDecimalString('100.00'));
    account.credit(Money.fromDecimalString('25.00'));
    account.debit(Money.fromDecimalString('10.00'));
    expect(account.getBalance().format()).toBe('115.00');
  });

  it('rejects overdraft and leaves balance unchanged', () => {
    const account = new Account(accountNumber, Money.fromDecimalString('10.00'));
    expect(account.canDebit(Money.fromDecimalString('10.01'))).toBe(false);
    expect(() => {
      account.debit(Money.fromDecimalString('10.01'));
    }).toThrow(InsufficientFundsError);
    expect(account.getBalance().format()).toBe('10.00');
  });

  it('allows debits up to the available balance', () => {
    const account = new Account(accountNumber, Money.fromDecimalString('10.00'));
    account.debit(Money.fromDecimalString('10.00'));
    expect(account.getBalance().format()).toBe('0.00');
  });
});
