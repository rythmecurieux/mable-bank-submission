import { lstatSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { DomainError } from '../domain/errors.js';

export class InputFileValidationError extends DomainError {}

const MAX_BYTES = 10 * 1024 * 1024;

export function validateInputFile(path: string | undefined): string {
  if (path === undefined || path.trim().length === 0) {
    throw new InputFileValidationError('Path is required');
  }

  const expanded = resolve(path);
  try {
    const stats = statSync(expanded);
    if (!stats.isFile()) {
      throw new InputFileValidationError(`File not found: ${path}`);
    }
  } catch (error) {
    if (error instanceof InputFileValidationError) {
      throw error;
    }
    throw new InputFileValidationError(`File not found: ${path}`);
  }

  try {
    const linkStats = lstatSync(expanded);
    if (linkStats.isSymbolicLink()) {
      throw new InputFileValidationError(`Not a regular file: ${path}`);
    }
  } catch (error) {
    if (error instanceof InputFileValidationError) {
      throw error;
    }
    throw new InputFileValidationError(`Not a regular file: ${path}`);
  }

  const size = statSync(expanded).size;
  if (size > MAX_BYTES) {
    throw new InputFileValidationError(`File too large (max ${String(MAX_BYTES)} bytes): ${path}`);
  }

  return expanded;
}
