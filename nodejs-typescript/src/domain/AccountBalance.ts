import type { AccountNumber } from './AccountNumber.js';
import type { Money } from './Money.js';

export class AccountBalance {
  constructor(
    readonly accountNumber: AccountNumber,
    readonly balance: Money,
  ) {}
}
