import { randomUUID } from 'node:crypto';
import type { CompanyAccountBook } from '../domain/CompanyAccountBook.js';
import type { TransferInstruction } from '../domain/TransferInstruction.js';
import type { TransferResult } from '../domain/TransferResult.js';
import {
  isTransferSuccess,
  transferReasonCode,
  transferSkipped,
} from '../domain/TransferResult.js';
import type { IdempotencyRegistry } from './IdempotencyRegistry.js';
import type { TransferJournal, TransferJournalEntry } from './TransferJournal.js';

export class ProcessTransfers {
  constructor(
    private readonly accountBook: CompanyAccountBook,
    private readonly dryRun = false,
    private readonly idempotencyRegistry: IdempotencyRegistry | null = null,
    private readonly transferJournal: TransferJournal | null = null,
    private readonly runId: string | null = null,
  ) {}

  process(instruction: TransferInstruction): TransferResult {
    if (this.idempotencyRegistry?.isProcessed(instruction.transferId)) {
      const skipped = transferSkipped(instruction);
      this.journalRecord(skipped);
      return skipped;
    }

    const result = this.dryRun
      ? this.accountBook.simulate(instruction)
      : this.accountBook.transfer(instruction);

    if (isTransferSuccess(result) && !this.dryRun) {
      this.idempotencyRegistry?.register(instruction.transferId);
    }

    this.journalRecord(result);
    return result;
  }

  processAll(instructions: readonly TransferInstruction[]): TransferResult[] {
    return instructions.map((instruction) => this.process(instruction));
  }

  private journalRecord(result: TransferResult): void {
    if (!this.transferJournal || !this.runId) return;

    const outcome =
      result.status === 'success' ? 'succeeded' : result.status === 'skipped' ? 'skipped' : 'failed';

    const entry: TransferJournalEntry = {
      runId: this.runId,
      transferId: result.instruction.transferId,
      outcome,
      reasonCode: transferReasonCode(result),
      instruction: result.instruction,
      recordedAt: new Date(),
    };
    this.transferJournal.record(entry);
  }
}

export function processTransfers(
  accountBook: CompanyAccountBook,
  instructions: readonly TransferInstruction[],
  dryRun = false,
): TransferResult[] {
  return new ProcessTransfers(accountBook, dryRun).processAll(instructions);
}

export function newRunId(): string {
  return randomUUID();
}
