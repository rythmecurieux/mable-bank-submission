import type { TransferResult } from '../../domain/TransferResult.js';
import {
  isTransferSkipped,
  isTransferSuccess,
  transferReasonCode,
} from '../../domain/TransferResult.js';

export type TransferProcessedLogEntry = {
  readonly event: typeof TransferProcessedTelemetry.EVENT_NAME;
  readonly outcome: string;
  readonly reason_code: string | null;
  readonly transfer_id: string;
  readonly from: string;
  readonly to: string;
};

export type MetricIncrement = {
  readonly name: typeof TransferProcessedTelemetry.METRIC_NAME;
  readonly outcome: string;
  readonly reason: string | null;
};

export class TransferProcessedTelemetry {
  static readonly METRIC_NAME = 'transfer.processed' as const;
  static readonly EVENT_NAME = 'transfer.processed' as const;

  private constructor(
    readonly outcome: string,
    readonly reasonCode: string | null,
    readonly transferId: string,
    readonly from: string,
    readonly to: string,
  ) {}

  static fromResult(result: TransferResult): TransferProcessedTelemetry {
    const outcome = isTransferSuccess(result)
      ? 'succeeded'
      : isTransferSkipped(result)
        ? 'skipped'
        : 'failed';
    return new TransferProcessedTelemetry(
      outcome,
      transferReasonCode(result),
      result.instruction.transferId.toString(),
      result.instruction.fromAccountNumber.toString(),
      result.instruction.toAccountNumber.toString(),
    );
  }

  toLogEntry(): TransferProcessedLogEntry {
    return {
      event: TransferProcessedTelemetry.EVENT_NAME,
      outcome: this.outcome,
      reason_code: this.reasonCode,
      transfer_id: this.transferId,
      from: this.from,
      to: this.to,
    };
  }

  toMetricIncrement(): MetricIncrement {
    return {
      name: TransferProcessedTelemetry.METRIC_NAME,
      outcome: this.outcome,
      reason: this.reasonCode,
    };
  }
}
