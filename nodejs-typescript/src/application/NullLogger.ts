import type { Logger } from './Logger.js';

export class NullLogger implements Logger {
  logTransferProcessed(): void {
    return undefined;
  }
}
