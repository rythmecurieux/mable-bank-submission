import { describe, expect, it } from 'vitest';
import { ProcessDay } from '../../src/application/ProcessDay.js';
import { ProcessingReport } from '../../src/application/ProcessingReport.js';
import { CsvAccountBalanceReader } from '../../src/infrastructure/CsvAccountBalanceReader.js';
import { CsvTransferInstructionReader } from '../../src/infrastructure/CsvTransferInstructionReader.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');

describe('ProcessDay', () => {
  const balancesPath = join(fixturesDir, 'mable_account_balances.csv');
  const transactionsPath = join(fixturesDir, 'mable_transactions.csv');

  it('returns a processing report with final balances', () => {
    const report = new ProcessDay({
      balancesReader: new CsvAccountBalanceReader(balancesPath),
      transfersReader: new CsvTransferInstructionReader(transactionsPath),
    }).call();

    expect(report).toBeInstanceOf(ProcessingReport);
    expect(report.succeededCount).toBe(4);
    expect(report.finalBalances).toHaveLength(5);
  });

  it('matches the provided example balances', () => {
    const report = new ProcessDay({
      balancesReader: new CsvAccountBalanceReader(balancesPath),
      transfersReader: new CsvTransferInstructionReader(transactionsPath),
    }).call();

    const balances = Object.fromEntries(
      report.finalBalances.map((snapshot) => [
        snapshot.accountNumber.toString(),
        snapshot.balance.format(),
      ]),
    );

    expect(balances['1111234522226789']).toBe('4820.50');
    expect(balances['3212343433335755']).toBe('48679.50');
  });

  it('reports success without changing starting balances in dry run', () => {
    const report = new ProcessDay({
      balancesReader: new CsvAccountBalanceReader(balancesPath),
      transfersReader: new CsvTransferInstructionReader(transactionsPath),
      dryRun: true,
    }).call();

    expect(report.dryRunMode).toBe(true);
    expect(report.succeededCount).toBe(4);
    const starting = report.finalBalances.find(
      (snapshot) => snapshot.accountNumber.toString() === '1111234522226789',
    );
    expect(starting?.balance.format()).toBe('5000.00');
  });
});
