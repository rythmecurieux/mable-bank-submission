import { Account } from '../domain/Account.js';
import { AccountNumber } from '../domain/AccountNumber.js';
import { Money } from '../domain/Money.js';
import type { AccountBalanceReader } from '../application/LoadAccountBalances.js';
import { CsvParseError, csvParseError } from './errors.js';
import { columnIndex, readCsvRecords, rowNumber } from './csv.js';

export class CsvAccountBalanceReader implements AccountBalanceReader {
  constructor(private readonly path: string) {}

  eachAccount(callback: (account: Account) => void): void {
    for (const account of this.read()) {
      callback(account);
    }
  }

  read(): Account[] {
    let records: ReturnType<typeof readCsvRecords>;
    try {
      records = readCsvRecords(this.path);
    } catch (error) {
      throw csvParseError(`Account balances file not found: ${this.path}`, error);
    }

    const accountIndex = columnIndex(records.headers, 'Account');
    const balanceIndex = columnIndex(records.headers, 'Balance');
    return records.rows.map((row, index) =>
      this.parseRow(row, rowNumber(index), accountIndex, balanceIndex),
    );
  }

  private parseRow(
    row: string[],
    lineNumber: number,
    accountIndex: number,
    balanceIndex: number,
  ): Account {
    const accountValue = row[accountIndex];
    const balanceValue = row[balanceIndex];
    if (accountValue === undefined || balanceValue === undefined) {
      throw new CsvParseError(`Row ${String(lineNumber)}: missing Account or Balance`);
    }

    try {
      const accountNumber = AccountNumber.parse(accountValue);
      const balance = Money.fromDecimalString(balanceValue);
      return new Account(accountNumber, balance);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw csvParseError(`Row ${String(lineNumber)}: ${message}`, error);
    }
  }
}
