import { describe, expect, it } from 'vitest';
import { processTransfers } from '../../src/application/ProcessTransfers.js';
import { Account } from '../../src/domain/Account.js';
import { AccountNumber } from '../../src/domain/AccountNumber.js';
import { CompanyAccountBook } from '../../src/domain/CompanyAccountBook.js';
import { createTransferInstruction } from '../../src/domain/TransferInstruction.js';
import { isTransferSuccess } from '../../src/domain/TransferResult.js';
import { Money } from '../../src/domain/Money.js';
import { CsvTransferInstructionReader } from '../../src/infrastructure/CsvTransferInstructionReader.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');

function exampleBook(): CompanyAccountBook {
  return new CompanyAccountBook([
    new Account(AccountNumber.parse('1111234522226789'), Money.fromDecimalString('5000.00')),
    new Account(AccountNumber.parse('1111234522221234'), Money.fromDecimalString('10000.00')),
    new Account(AccountNumber.parse('2222123433331212'), Money.fromDecimalString('550.00')),
    new Account(AccountNumber.parse('1212343433335665'), Money.fromDecimalString('1200.00')),
    new Account(AccountNumber.parse('3212343433335755'), Money.fromDecimalString('50000.00')),
  ]);
}

describe('ProcessTransfers', () => {
  it('matches expected final balances for fixture transfers', () => {
    const book = exampleBook();
    const instructions = new CsvTransferInstructionReader(
      join(fixturesDir, 'mable_transactions.csv'),
    ).readAll();
    const results = processTransfers(book, instructions);

    expect(results.every(isTransferSuccess)).toBe(true);
    const balances = Object.fromEntries(
      book
        .finalBalances()
        .map((snapshot) => [snapshot.accountNumber.toString(), snapshot.balance.format()]),
    );
    expect(balances).toEqual({
      '1111234522221234': '9974.40',
      '1111234522226789': '4820.50',
      '1212343433335665': '1725.60',
      '2222123433331212': '1550.00',
      '3212343433335755': '48679.50',
    });
  });

  it('continues after a failed transfer', () => {
    const book = exampleBook();
    const failing = createTransferInstruction({
      fromAccountNumber: AccountNumber.parse('1111234522226789'),
      toAccountNumber: AccountNumber.parse('1212343433335665'),
      amount: Money.fromDecimalString('999999.00'),
    });
    const instructions = new CsvTransferInstructionReader(
      join(fixturesDir, 'mable_transactions.csv'),
    ).readAll();
    const results = processTransfers(book, [failing, ...instructions]);
    expect(results[0]?.status).toBe('failure');
    expect(results.slice(1).every(isTransferSuccess)).toBe(true);
  });
});

describe('ProcessTransfers dry run', () => {
  it('simulates without mutating balances', () => {
    const book = exampleBook();
    const instructions = new CsvTransferInstructionReader(
      join(fixturesDir, 'mable_transactions.csv'),
    ).readAll();
    processTransfers(book, instructions, true);

    expect(book.balanceFor(AccountNumber.parse('1111234522226789'))?.balance.format()).toBe(
      '5000.00',
    );
  });
});
