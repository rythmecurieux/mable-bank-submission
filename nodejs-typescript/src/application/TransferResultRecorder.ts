import type { TransferResult } from '../domain/TransferResult.js';
import { isTransferFailure, isTransferSkipped, isTransferSuccess } from '../domain/TransferResult.js';

export type TransferFailureResult = Extract<TransferResult, { status: 'failure' }>;

/** Records transfer outcomes incrementally. Retains failures for reporting, not every success. */
export class TransferResultRecorder {
  readonly #failedResults: TransferFailureResult[] = [];
  processedCount = 0;
  succeededCount = 0;
  failedCount = 0;
  skippedCount = 0;

  get failedResults(): readonly TransferFailureResult[] {
    return this.#failedResults;
  }

  record(result: TransferResult): TransferResult {
    this.processedCount += 1;
    if (isTransferSuccess(result)) {
      this.succeededCount += 1;
    } else if (isTransferSkipped(result)) {
      this.skippedCount += 1;
    } else if (isTransferFailure(result)) {
      this.failedCount += 1;
      this.#failedResults.push(result);
    }
    return result;
  }
}
