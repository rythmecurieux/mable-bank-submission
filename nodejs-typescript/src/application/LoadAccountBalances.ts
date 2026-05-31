import { Account } from '../domain/Account.js';
import { CompanyAccountBook } from '../domain/CompanyAccountBook.js';
import { RollingBackLedger } from './RollingBackLedger.js';

export type AccountBalanceReader = {
  eachAccount?(callback: (account: Account) => void): void;
  read?(): Account[];
};

export function loadAccountBalances(reader: AccountBalanceReader): CompanyAccountBook {
  const book = new CompanyAccountBook();
  streamAccounts(reader, (account) => {
    book.addAccount(account);
  });
  book.setLedger(new RollingBackLedger(book));
  return book;
}

function streamAccounts(reader: AccountBalanceReader, callback: (account: Account) => void): void {
  if (reader.eachAccount) {
    reader.eachAccount(callback);
    return;
  }
  if (reader.read) {
    for (const account of reader.read()) {
      callback(account);
    }
    return;
  }
  throw new Error('Account balance reader must implement eachAccount or read');
}
