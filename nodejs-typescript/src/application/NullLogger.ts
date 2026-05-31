import type { Logger } from './Logger.js';

export class NullLogger implements Logger {
  info(): void {
    return undefined;
  }
}
