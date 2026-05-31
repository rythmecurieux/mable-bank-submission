import { describe, expect, it } from 'vitest';
import { ProcessDay } from '../../src/application/ProcessDay.js';
import { RecordingLogger } from '../../src/application/RecordingLogger.js';
import { RecordingMetrics } from '../../src/application/RecordingMetrics.js';
import { CsvAccountBalanceReader } from '../../src/infrastructure/CsvAccountBalanceReader.js';
import { CsvTransferInstructionReader } from '../../src/infrastructure/CsvTransferInstructionReader.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');

describe('ProcessDay observability', () => {
  it('records metrics and log entries for each transfer', () => {
    const logger = new RecordingLogger();
    const metrics = new RecordingMetrics();

    new ProcessDay({
      balancesReader: new CsvAccountBalanceReader(
        join(fixturesDir, 'mable_account_balances.csv'),
      ),
      transfersReader: new CsvTransferInstructionReader(
        join(fixturesDir, 'mable_transactions.csv'),
      ),
      logger,
      metrics,
    }).call();

    expect(metrics.increments).toHaveLength(4);
    expect(metrics.increments.every((entry) => entry.name === 'transfer.processed')).toBe(true);
    expect(logger.entries).toHaveLength(4);
    expect(logger.entries[0]).toMatchObject({
      event: 'transfer.processed',
      outcome: 'succeeded',
    });
  });
});
