import { describe, expect, it } from 'vitest';
import { ProcessDay } from '../../src/application/ProcessDay.js';
import { CsvAccountBalanceReader } from '../../src/infrastructure/CsvAccountBalanceReader.js';
import { CsvTransferInstructionReader } from '../../src/infrastructure/CsvTransferInstructionReader.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');

describe('Idempotency and transfer journal', () => {
  it('skips duplicate transfer without double debit and records journal', () => {
    const report = new ProcessDay({
      balancesReader: new CsvAccountBalanceReader(join(fixturesDir, 'mable_account_balances.csv')),
      transfersReader: new CsvTransferInstructionReader(
        join(fixturesDir, 'mable_transactions_duplicate.csv'),
      ),
    }).call();

    expect(report.succeededCount).toBe(4);
    expect(report.skippedCount).toBe(1);
    expect(report.journalEntries).toHaveLength(5);
    expect(report.journalEntries.filter((entry) => entry.outcome === 'skipped')).toHaveLength(1);

    const balance = report.finalBalances.find(
      (snapshot) => snapshot.accountNumber.toString() === '1111234522226789',
    );
    expect(balance?.balance.format()).toBe('4820.50');
  });
});
