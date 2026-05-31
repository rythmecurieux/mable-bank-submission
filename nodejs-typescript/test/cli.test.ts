import { describe, expect, it } from 'vitest';
import { runCli } from '../src/cli.js';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

function captureStdout(run: () => number): { exitCode: number; output: string } {
  const chunks: string[] = [];
  const originalLog = console.log;
  console.log = (message?: unknown) => {
    if (typeof message === 'string') {
      chunks.push(message);
    } else if (message === undefined) {
      chunks.push('');
    } else {
      chunks.push(JSON.stringify(message));
    }
  };
  try {
    const exitCode = run();
    return { exitCode, output: chunks.join('\n') };
  } finally {
    console.log = originalLog;
  }
}

describe('CLI', () => {
  it('runs with valid fixture files', () => {
    const { exitCode, output } = captureStdout(() =>
      runCli([
        join(fixturesDir, 'mable_account_balances.csv'),
        join(fixturesDir, 'mable_transactions.csv'),
      ]),
    );

    expect(exitCode).toBe(0);
    expect(output).toContain('Mable Bank Transfer Processing');
    expect(output).toContain('Successful transfers: 4');
    expect(output).toContain('1111234522226789: 4820.50');
  });

  it('supports dry run mode without mutating balances', () => {
    const { exitCode, output } = captureStdout(() =>
      runCli([
        '--dry-run',
        join(fixturesDir, 'mable_account_balances.csv'),
        join(fixturesDir, 'mable_transactions.csv'),
      ]),
    );

    expect(exitCode).toBe(0);
    expect(output).toContain('dry run');
    expect(output).toContain('1111234522226789: 5000.00');
    expect(output).toContain('No balances were mutated during dry run.');
  });

  it('returns non-zero for invalid usage', () => {
    expect(runCli([])).toBe(1);
  });

  it('returns non-zero for unreadable files', () => {
    expect(
      runCli(['missing.csv', join(fixturesDir, 'mable_transactions.csv')]),
    ).toBe(1);
  });

  it('returns non-zero for duplicate account numbers in balances file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mable-balances-'));
    const path = join(dir, 'balances.csv');
    writeFileSync(
      path,
      'Account,Balance\n1111234522226789,100.00\n1111234522226789,200.00\n',
    );

    expect(runCli([path, join(fixturesDir, 'mable_transactions.csv')])).toBe(1);
  });
});
