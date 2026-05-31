import { describe, expect, it } from 'vitest';
import { CsvParseError } from '../../src/infrastructure/errors.js';
import { CsvAccountBalanceReader } from '../../src/infrastructure/CsvAccountBalanceReader.js';
import { CsvTransferInstructionReader } from '../../src/infrastructure/CsvTransferInstructionReader.js';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');

describe('CsvAccountBalanceReader', () => {
  it('reads valid balances with headers', () => {
    const accounts: string[] = [];
    new CsvAccountBalanceReader(join(fixturesDir, 'mable_account_balances.csv')).eachAccount(
      (account) => {
        accounts.push(account.accountNumber.toString());
      },
    );
    expect(accounts).toHaveLength(5);
  });

  it('rejects malformed rows and missing files', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mable-balances-'));
    const path = join(dir, 'bad.csv');
    writeFileSync(path, 'Account,Balance\n1111234522226789\n');

    expect(() => {
      new CsvAccountBalanceReader(path).eachAccount(() => {
        /* noop */
      });
    }).toThrow(CsvParseError);
    expect(() => {
      new CsvAccountBalanceReader('missing.csv').eachAccount(() => {
        /* noop */
      });
    }).toThrow(CsvParseError);
  });
});

describe('CsvTransferInstructionReader', () => {
  it('reads valid transfer instructions', () => {
    const instructions = new CsvTransferInstructionReader(
      join(fixturesDir, 'mable_transactions.csv'),
    ).readAll();
    expect(instructions).toHaveLength(4);
  });

  it('rejects malformed rows', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mable-transactions-'));
    const path = join(dir, 'bad.csv');
    writeFileSync(path, 'From,To,Amount\n1111234522226789,1212343433335665\n');

    expect(() => new CsvTransferInstructionReader(path).readAll()).toThrow(CsvParseError);
  });
});
