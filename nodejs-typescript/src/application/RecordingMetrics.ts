import type { Metrics } from './Metrics.js';
import type {
  MetricIncrement,
  TransferProcessedTelemetry,
} from './telemetry/TransferProcessedTelemetry.js';

export class RecordingMetrics implements Metrics {
  readonly records: TransferProcessedTelemetry[] = [];
  readonly increments: MetricIncrement[] = [];

  recordTransferProcessed(telemetry: TransferProcessedTelemetry): void {
    this.records.push(telemetry);
    this.increments.push(telemetry.toMetricIncrement());
  }
}

export type { MetricIncrement };
