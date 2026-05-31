import type { AccountBalance } from '../domain/AccountBalance.js';
import type { CompanyAccountBook } from '../domain/CompanyAccountBook.js';
import type { TransferResult } from '../domain/TransferResult.js';
import type { TransferJournal, TransferJournalEntry } from './TransferJournal.js';
import type { TransferResultRecorder } from './TransferResultRecorder.js';

export class ProcessingReport {
  constructor(
    private readonly recorder: TransferResultRecorder,
    private readonly accountBook: CompanyAccountBook,
    private readonly dryRun: boolean,
    private readonly transferJournal: TransferJournal | null = null,
    private readonly runId: string | null = null,
  ) {}

  get finalBalances(): readonly AccountBalance[] {
    return this.accountBook.finalBalances();
  }

  get dryRunMode(): boolean {
    return this.dryRun;
  }

  get processedCount(): number {
    return this.recorder.processedCount;
  }

  get succeededCount(): number {
    return this.recorder.succeededCount;
  }

  get failedCount(): number {
    return this.recorder.failedCount;
  }

  get skippedCount(): number {
    return this.recorder.skippedCount;
  }

  get failedResults(): readonly TransferResult[] {
    return this.recorder.failedResults;
  }

  get journalEntries(): readonly TransferJournalEntry[] {
    return this.transferJournal?.entries ?? [];
  }

  get processingRunId(): string | null {
    return this.runId;
  }
}
