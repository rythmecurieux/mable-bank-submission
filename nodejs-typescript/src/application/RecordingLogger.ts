import type { LogPayload, Logger } from './Logger.js';

export class RecordingLogger implements Logger {
  readonly entries: LogPayload[] = [];

  info(payload: LogPayload): void {
    this.entries.push(payload);
  }
}
