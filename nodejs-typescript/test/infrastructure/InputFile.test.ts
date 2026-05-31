import { describe, expect, it } from 'vitest';
import { InputFileValidationError, validateInputFile } from '../../src/infrastructure/InputFile.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');

describe('InputFile', () => {
  it('returns expanded path for a readable file', () => {
    const path = join(fixturesDir, 'mable_account_balances.csv');
    expect(validateInputFile(path)).toBe(path);
  });

  it('rejects missing files', () => {
    expect(() => validateInputFile('missing.csv')).toThrow(InputFileValidationError);
    expect(() => validateInputFile('missing.csv')).toThrow(/not found/);
  });

  it('rejects empty path', () => {
    expect(() => validateInputFile('   ')).toThrow(InputFileValidationError);
    expect(() => validateInputFile('   ')).toThrow(/required/);
  });
});
