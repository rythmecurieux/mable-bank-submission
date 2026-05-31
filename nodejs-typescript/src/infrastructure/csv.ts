import { readFileSync, existsSync } from 'node:fs';

/**
 * RFC 4180-style CSV parse for bounded batch files (ADR-004).
 * Handles quoted fields and escaped double quotes.
 */
export function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let index = 0;
  let inQuotes = false;

  while (index < line.length) {
    const char = line[index];
    if (inQuotes) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 2;
          continue;
        }
        inQuotes = false;
        index += 1;
        continue;
      }
      current += char;
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      index += 1;
      continue;
    }

    if (char === ',') {
      cells.push(current.trim());
      current = '';
      index += 1;
      continue;
    }

    current += char;
    index += 1;
  }

  cells.push(current.trim());
  return cells;
}

export function readCsvRows(path: string): string[][] {
  const contents = readFileSync(path, 'utf8');
  return contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(parseCsvLine);
}

export function readCsvRecords(path: string): { headers: string[]; rows: string[][] } {
  if (!existsSync(path)) {
    throw new Error(`ENOENT:${path}`);
  }
  const rows = readCsvRows(path);
  const headerRow = rows[0];
  if (!headerRow) {
    throw new Error(`CSV file is empty: ${path}`);
  }
  return {
    headers: headerRow,
    rows: rows.slice(1),
  };
}

export function rowNumber(index: number): number {
  return index + 2;
}

export function columnIndex(headers: string[], name: string): number {
  const index = headers.findIndex((header) => header.trim().toLowerCase() === name.toLowerCase());
  if (index < 0) {
    throw new Error(`Missing required column: ${name}`);
  }
  return index;
}
