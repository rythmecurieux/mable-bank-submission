import type { CompanyAccountBook } from '../domain/CompanyAccountBook.js';
import type { Ledger } from '../domain/Ledger.js';

/** Synchronous transactional boundary: on any error during apply, restore pre-transfer balances. */
export class RollingBackLedger implements Ledger {
  constructor(private readonly accountBook: CompanyAccountBook) {}

  atomic<T>(operation: () => T): T {
    const snapshot = this.accountBook.captureBalanceSnapshot();
    try {
      return operation();
    } catch (error) {
      this.accountBook.restoreBalanceSnapshot(snapshot);
      throw error;
    }
  }
}
