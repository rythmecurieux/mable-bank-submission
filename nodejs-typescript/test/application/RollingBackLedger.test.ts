import { describe, expect, it } from 'vitest';
import { RollingBackLedger } from '../../src/application/RollingBackLedger.js';
import { Account } from '../../src/domain/Account.js';
import { AccountNumber } from '../../src/domain/AccountNumber.js';
import type { CreditPolicy } from '../../src/domain/CreditPolicy.js';
import { CompanyAccountBook } from '../../src/domain/CompanyAccountBook.js';
import { Money } from '../../src/domain/Money.js';
import { buildAccount, buildInstruction, balanceAmount } from '../support/domainHelpers.js';

class FailingCreditPolicy implements CreditPolicy {
  applyCredit(_currentBalance: Money, _amount: Money): Money {
    throw new Error('credit failed');
  }
}

describe('RollingBackLedger', () => {
  it('restores balances when apply raises after debit', () => {
    const source = buildAccount('1111234522226789', '100.00');
    const destination = new Account(
      AccountNumber.parse('1212343433335665'),
      Money.fromDecimalString('50.00'),
      new FailingCreditPolicy(),
    );
    const book = new CompanyAccountBook([source, destination]);
    book.setLedger(new RollingBackLedger(book));
    const instruction = buildInstruction(
      '1111234522226789',
      '1212343433335665',
      '10.00',
    );

    expect(() => book.transfer(instruction)).toThrow(/credit failed/);
    expect(balanceAmount(book, '1111234522226789')).toBe('100.00');
    expect(balanceAmount(book, '1212343433335665')).toBe('50.00');
  });
});
