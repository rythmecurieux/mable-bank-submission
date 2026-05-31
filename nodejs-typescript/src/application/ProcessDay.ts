import { verifyReconciliation } from '../domain/Reconciliation.js';
import type { TransferResult } from '../domain/TransferResult.js';
import { TransferProcessedTelemetry } from './telemetry/TransferProcessedTelemetry.js';
import type { AccountBalanceReader, TransferInstructionReader } from './ports/readers.js';
import { loadAccountBalances } from './LoadAccountBalances.js';
import type { Logger } from './Logger.js';
import type { Metrics } from './Metrics.js';
import { NullLogger } from './NullLogger.js';
import { NullMetrics } from './NullMetrics.js';
import { ProcessingReport } from './ProcessingReport.js';
import { ProcessTransfers, newRunId } from './ProcessTransfers.js';
import { TransferResultRecorder } from './TransferResultRecorder.js';
import { InMemoryIdempotencyRegistry } from './IdempotencyRegistry.js';
import { InMemoryTransferJournal } from './TransferJournal.js';

export type { AccountBalanceReader, TransferInstructionReader } from './ports/readers.js';

export type ProcessDayOptions = {
  readonly balancesReader: AccountBalanceReader;
  readonly transfersReader: TransferInstructionReader;
  readonly dryRun?: boolean;
  readonly logger?: Logger;
  readonly metrics?: Metrics;
};

export class ProcessDay {
  private readonly logger: Logger;
  private readonly metrics: Metrics;

  constructor(private readonly options: ProcessDayOptions) {
    this.logger = options.logger ?? new NullLogger();
    this.metrics = options.metrics ?? new NullMetrics();
  }

  call(): ProcessingReport {
    const runId = newRunId();
    const accountBook = loadAccountBalances(this.options.balancesReader);
    const journal = new InMemoryTransferJournal();
    const registry = this.options.dryRun ? null : new InMemoryIdempotencyRegistry();
    const processor = new ProcessTransfers(
      accountBook,
      this.options.dryRun ?? false,
      registry,
      journal,
      runId,
    );
    const recorder = new TransferResultRecorder();

    this.options.transfersReader.eachInstruction((instruction) => {
      const result = recorder.record(processor.process(instruction));
      this.observeTransfer(result);
    });

    if (!this.options.dryRun) {
      verifyReconciliation(accountBook);
    }

    return new ProcessingReport(recorder, accountBook, this.options.dryRun ?? false, journal, runId);
  }

  private observeTransfer(result: TransferResult): void {
    const telemetry = TransferProcessedTelemetry.fromResult(result);
    this.metrics.recordTransferProcessed(telemetry);
    this.logger.logTransferProcessed(telemetry);
  }
}
