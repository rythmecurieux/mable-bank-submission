import type { CompanyAccountBook } from './CompanyAccountBook.js';
import { ReconciliationError } from './errors.js';

export function verifyReconciliation(accountBook: CompanyAccountBook): void {
  for (const snapshot of accountBook.finalBalances()) {
    if (snapshot.balance.isNegative()) {
      throw new ReconciliationError(
        `Negative balance on account ${snapshot.accountNumber.toString()}`,
      );
    }
  }
}
