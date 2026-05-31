import { describe, expect, it } from 'vitest';
import { ProcessDay } from '../../src/application/ProcessDay.js';
import { RecordingLogger } from '../../src/application/RecordingLogger.js';
import { RecordingMetrics } from '../../src/application/RecordingMetrics.js';
import { TransferProcessedTelemetry } from '../../src/application/telemetry/TransferProcessedTelemetry.js';
import { CsvAccountBalanceReader } from '../../src/infrastructure/CsvAccountBalanceReader.js';
import { CsvTransferInstructionReader } from '../../src/infrastructure/CsvTransferInstructionReader.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');

describe('ProcessDay observability', () => {
  it('records ADR 005 wire contract for each transfer', () => {
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

    expect(metrics.records).toHaveLength(4);
    expect(metrics.increments).toHaveLength(4);
    expect(metrics.increments.every((entry) => entry.name === TransferProcessedTelemetry.METRIC_NAME)).toBe(true);
    expect(metrics.increments.every((entry) => entry.outcome === 'succeeded' && entry.reason === null)).toBe(true);

    expect(logger.wireEntries).toHaveLength(4);
    expect(logger.wireEntries.every((entry) => entry.event === TransferProcessedTelemetry.EVENT_NAME)).toBe(true);

    const first = logger.wireEntries[0];
    expect(first?.outcome).toBe('succeeded');
    expect(first?.from).toBe('1111234522226789');
    expect(first?.to).toBe('1212343433335665');
    expect(first?.transfer_id).toBeTruthy();
    expect(first?.reason_code).toBeNull();
  });
});
