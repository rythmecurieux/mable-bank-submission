import { describe, expect, it } from 'vitest';
import { LoadAccountBalancesError, loadAccountBalances } from '../../src/application/LoadAccountBalances.js';
import { Account } from '../../src/domain/Account.js';
import { AccountNumber } from '../../src/domain/AccountNumber.js';
import { DuplicateAccountError } from '../../src/domain/errors.js';
import { Money } from '../../src/domain/Money.js';
import { CsvAccountBalanceReader } from '../../src/infrastructure/CsvAccountBalanceReader.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');

describe('LoadAccountBalances', () => {
  it('loads balances from fixture CSV and wires rolling-back ledger', () => {
    const book = loadAccountBalances(
      new CsvAccountBalanceReader(join(fixturesDir, 'mable_account_balances.csv')),
    );
    expect(book.balanceFor(AccountNumber.parse('1111234522226789'))?.balance.format()).toBe(
      '5000.00',
    );
  });

  it('rejects readers that do not implement eachAccount', () => {
    expect(() => loadAccountBalances({} as never)).toThrow(LoadAccountBalancesError);
  });

  it('rejects duplicate accounts while streaming', () => {
    const reader = {
      eachAccount(callback: (account: Account) => void): void {
        callback(new Account(AccountNumber.parse('1111234522226789'), Money.fromDecimalString('1.00')));
        callback(new Account(AccountNumber.parse('1111234522226789'), Money.fromDecimalString('2.00')));
      },
    };
    expect(() => loadAccountBalances(reader)).toThrow(DuplicateAccountError);
  });
});
