import type { AccountNumber } from './AccountNumber.js';
import { InsufficientFundsError } from './errors.js';
import type { CreditPolicy } from './CreditPolicy.js';
import { DefaultCreditPolicy } from './CreditPolicy.js';
import type { Money } from './Money.js';

export class Account {
  constructor(
    readonly accountNumber: AccountNumber,
    private balance: Money,
    private readonly creditPolicy: CreditPolicy = DefaultCreditPolicy.getInstance(),
  ) {}

  getBalance(): Money {
    return this.balance;
  }

  credit(amount: Money): void {
    this.balance = this.creditPolicy.applyCredit(this.balance, amount);
  }

  canDebit(amount: Money): boolean {
    return this.balance.canSubtract(amount);
  }

  debit(amount: Money): void {
    if (!this.canDebit(amount)) {
      throw new InsufficientFundsError('Insufficient funds');
    }
    this.balance = this.balance.subtract(amount);
  }

  replaceBalance(balance: Money): void {
    this.balance = balance;
  }

  copy(): Account {
    return new Account(this.accountNumber, this.getBalance(), this.creditPolicy);
  }
}
