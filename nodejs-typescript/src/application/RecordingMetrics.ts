import type { MetricTags, Metrics } from './Metrics.js';

export type RecordedIncrement = {
  readonly name: string;
  readonly tags: MetricTags;
};

export class RecordingMetrics implements Metrics {
  readonly increments: RecordedIncrement[] = [];

  increment(name: string, tags: MetricTags = {}): void {
    this.increments.push({ name, tags });
  }
}
