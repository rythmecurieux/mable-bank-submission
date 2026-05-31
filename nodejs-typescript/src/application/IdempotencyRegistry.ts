import type { TransferId } from '../domain/TransferId.js';

export interface IdempotencyRegistry {
  isProcessed(transferId: TransferId): boolean;
  register(transferId: TransferId): void;
}

export class InMemoryIdempotencyRegistry implements IdempotencyRegistry {
  private readonly processed = new Set<string>();

  isProcessed(transferId: TransferId): boolean {
    return this.processed.has(transferId.toString());
  }

  register(transferId: TransferId): void {
    this.processed.add(transferId.toString());
  }
}
