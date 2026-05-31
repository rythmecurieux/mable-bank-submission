import { describe, expect, it } from 'vitest';
import { AccountBalance } from '../../src/domain/AccountBalance.js';
import { AccountNumber } from '../../src/domain/AccountNumber.js';
import { CompanyAccountBook } from '../../src/domain/CompanyAccountBook.js';
import { ReconciliationError } from '../../src/domain/errors.js';
import { Money } from '../../src/domain/Money.js';
import { verifyReconciliation } from '../../src/domain/Reconciliation.js';
import { exampleAccountBook } from '../support/domainHelpers.js';

describe('Reconciliation', () => {
  it('passes when all balances are non-negative', () => {
    expect(() => {
      verifyReconciliation(exampleAccountBook());
    }).not.toThrow();
  });

  it('raises when any balance is negative', () => {
    const book = {
      finalBalances: () => [
        new AccountBalance(AccountNumber.parse('1111234522226789'), Money.fromCents(-100n)),
      ],
    } as CompanyAccountBook;

    expect(() => {
      verifyReconciliation(book);
    }).toThrow(ReconciliationError);
    expect(() => {
      verifyReconciliation(book);
    }).toThrow(/Negative balance/);
  });
});
