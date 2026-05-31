export interface Ledger {
  atomic<T>(operation: () => T): T;
}
