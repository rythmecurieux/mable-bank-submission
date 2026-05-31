import type { TransferProcessedTelemetry } from './telemetry/TransferProcessedTelemetry.js';

export interface Logger {
  logTransferProcessed(telemetry: TransferProcessedTelemetry): void;
}
