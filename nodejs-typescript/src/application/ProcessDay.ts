import { verifyReconciliation } from '../domain/Reconciliation.js';
import type { TransferInstruction } from '../domain/TransferInstruction.js';
import type { TransferResult } from '../domain/TransferResult.js';
import { isTransferSkipped, isTransferSuccess, transferReasonCode } from '../domain/TransferResult.js';
import { InMemoryIdempotencyRegistry } from './IdempotencyRegistry.js';
import type { Logger } from './Logger.js';
import { loadAccountBalances, type AccountBalanceReader } from './LoadAccountBalances.js';
import type { Metrics } from './Metrics.js';
import { NullLogger } from './NullLogger.js';
import { NullMetrics } from './NullMetrics.js';
import { ProcessingReport } from './ProcessingReport.js';
import { ProcessTransfers, newRunId } from './ProcessTransfers.js';
import { TransferResultRecorder } from './TransferResultRecorder.js';
import { InMemoryTransferJournal } from './TransferJournal.js';

export type TransferInstructionReader = {
  eachInstruction(callback: (instruction: TransferInstruction) => void): void;
};

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
    const outcome = isTransferSuccess(result)
      ? 'succeeded'
      : isTransferSkipped(result)
        ? 'skipped'
        : 'failed';
    const reasonCode = transferReasonCode(result);
    this.metrics.increment('transfer.processed', { outcome, reason: reasonCode });
    this.logger.info({
      event: 'transfer.processed',
      outcome,
      reasonCode,
      transferId: result.instruction.transferId.toString(),
      from: result.instruction.fromAccountNumber.toString(),
      to: result.instruction.toAccountNumber.toString(),
    });
  }
}
