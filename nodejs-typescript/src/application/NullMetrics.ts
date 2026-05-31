import type { Metrics } from './Metrics.js';

export class NullMetrics implements Metrics {
  recordTransferProcessed(): void {
    return undefined;
  }
}
