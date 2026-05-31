export type LogPayload = Record<string, string | number | boolean | undefined>;

export interface Logger {
  info(payload: LogPayload): void;
}
