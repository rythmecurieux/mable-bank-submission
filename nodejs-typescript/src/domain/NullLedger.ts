import type { Ledger } from './Ledger.js';

export class NullLedger implements Ledger {
  atomic<T>(operation: () => T): T {
    return operation();
  }
}
