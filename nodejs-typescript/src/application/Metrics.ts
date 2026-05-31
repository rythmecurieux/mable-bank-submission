export type MetricTags = Record<string, string | undefined>;

export interface Metrics {
  increment(name: string, tags?: MetricTags): void;
}
