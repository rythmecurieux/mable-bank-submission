import { Account } from '../domain/Account.js';
import { CompanyAccountBook } from '../domain/CompanyAccountBook.js';
import { LoadAccountBalancesError } from './errors.js';
import type { AccountBalanceReader } from './ports/readers.js';
import { RollingBackLedger } from './RollingBackLedger.js';

export type { AccountBalanceReader, TransferInstructionReader } from './ports/readers.js';
export { LoadAccountBalancesError } from './errors.js';

export function loadAccountBalances(reader: AccountBalanceReader): CompanyAccountBook {
  assertAccountBalanceReader(reader);
  const book = new CompanyAccountBook();
  reader.eachAccount((account) => {
    book.addAccount(account);
  });
  book.setLedger(new RollingBackLedger(book));
  return book;
}

export function assertAccountBalanceReader(
  reader: unknown,
): asserts reader is AccountBalanceReader {
  if (
    typeof reader !== 'object' ||
    reader === null ||
    typeof (reader as AccountBalanceReader).eachAccount !== 'function'
  ) {
    throw new LoadAccountBalancesError('Account balance reader must implement eachAccount');
  }
}

export function loadAccountBalancesFromUnknown(reader: unknown): CompanyAccountBook {
  assertAccountBalanceReader(reader);
  return loadAccountBalances(reader);
}

export type { Account };
