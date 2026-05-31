export class CsvParseError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

export function csvParseError(message: string, cause?: unknown): CsvParseError {
  if (cause instanceof Error) {
    return new CsvParseError(message, { cause });
  }
  return new CsvParseError(message);
}
