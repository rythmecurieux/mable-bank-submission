import type { Logger } from './Logger.js';
import type {
  TransferProcessedLogEntry,
  TransferProcessedTelemetry,
} from './telemetry/TransferProcessedTelemetry.js';

export class RecordingLogger implements Logger {
  readonly entries: TransferProcessedTelemetry[] = [];
  readonly wireEntries: TransferProcessedLogEntry[] = [];

  logTransferProcessed(telemetry: TransferProcessedTelemetry): void {
    this.entries.push(telemetry);
    this.wireEntries.push(telemetry.toLogEntry());
  }
}

export type { TransferProcessedLogEntry };
