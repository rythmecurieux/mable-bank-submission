import type { Money } from './Money.js';

/** Applies a credit to an account balance (parity with .NET ICreditPolicy). */
export interface CreditPolicy {
  applyCredit(currentBalance: Money, amount: Money): Money;
}

export class DefaultCreditPolicy implements CreditPolicy {
  private static readonly instance = new DefaultCreditPolicy();

  static getInstance(): DefaultCreditPolicy {
    return DefaultCreditPolicy.instance;
  }

  applyCredit(currentBalance: Money, amount: Money): Money {
    return currentBalance.add(amount);
  }
}
