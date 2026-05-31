import type { TransferProcessedTelemetry } from './telemetry/TransferProcessedTelemetry.js';

export interface Metrics {
  recordTransferProcessed(telemetry: TransferProcessedTelemetry): void;
}
