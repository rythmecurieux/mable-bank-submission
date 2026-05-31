import type { TransferId } from '../domain/TransferId.js';
import type { TransferInstruction } from '../domain/TransferInstruction.js';

export type TransferJournalEntry = {
  readonly runId: string;
  readonly transferId: TransferId;
  readonly outcome: 'succeeded' | 'failed' | 'skipped';
  readonly reasonCode: string | undefined;
  readonly instruction: TransferInstruction;
  readonly recordedAt: Date;
};

export interface TransferJournal {
  readonly entries: readonly TransferJournalEntry[];
  record(entry: TransferJournalEntry): void;
}

export class InMemoryTransferJournal implements TransferJournal {
  private readonly _entries: TransferJournalEntry[] = [];

  get entries(): readonly TransferJournalEntry[] {
    return this._entries;
  }

  record(entry: TransferJournalEntry): void {
    this._entries.push(entry);
  }
}
