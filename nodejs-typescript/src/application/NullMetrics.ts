import type { Metrics } from './Metrics.js';

export class NullMetrics implements Metrics {
  increment(): void {
    return undefined;
  }
}
