import { describe, expect, it } from 'vitest';
import { runCli } from '../src/cli.js';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

function captureIo(run: () => number): { exitCode: number; stdout: string; stderr: string } {
  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];
  const originalLog = console.log;
  const originalError = console.error;
  console.log = (message?: unknown) => {
    stdoutChunks.push(typeof message === 'string' ? message : String(message));
  };
  console.error = (message?: unknown) => {
    stderrChunks.push(typeof message === 'string' ? message : String(message));
  };
  try {
    const exitCode = run();
    return {
      exitCode,
      stdout: stdoutChunks.join('\n'),
      stderr: stderrChunks.join('\n'),
    };
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

describe('CLI', () => {
  it('runs with valid fixture files', () => {
    const { exitCode, stdout } = captureIo(() =>
      runCli([
        join(fixturesDir, 'mable_account_balances.csv'),
        join(fixturesDir, 'mable_transactions.csv'),
      ]),
    );

    expect(exitCode).toBe(0);
    expect(stdout).toContain('Mable Bank Transfer Processing');
    expect(stdout).toContain('Successful transfers: 4');
    expect(stdout).toContain('1111234522226789: 4820.50');
  });

  it('supports dry run mode without mutating balances', () => {
    const { exitCode, stdout } = captureIo(() =>
      runCli([
        '--dry-run',
        join(fixturesDir, 'mable_account_balances.csv'),
        join(fixturesDir, 'mable_transactions.csv'),
      ]),
    );

    expect(exitCode).toBe(0);
    expect(stdout).toContain('dry run');
    expect(stdout).toContain('1111234522226789: 5000.00');
    expect(stdout).toContain('No balances were mutated during dry run.');
  });

  it('returns non-zero for invalid usage and writes to stderr', () => {
    const { exitCode, stderr } = captureIo(() => runCli([]));
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Usage:');
  });

  it('returns non-zero for unreadable files with stderr message', () => {
    const { exitCode, stderr } = captureIo(() =>
      runCli(['missing.csv', join(fixturesDir, 'mable_transactions.csv')]),
    );
    expect(exitCode).toBe(1);
    expect(stderr).toMatch(/^Error:/);
  });

  it('returns non-zero for duplicate account numbers in balances file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mable-balances-'));
    const path = join(dir, 'balances.csv');
    writeFileSync(
      path,
      'Account,Balance\n1111234522226789,100.00\n1111234522226789,200.00\n',
    );

    const { exitCode, stderr } = captureIo(() =>
      runCli([path, join(fixturesDir, 'mable_transactions.csv')]),
    );
    expect(exitCode).toBe(1);
    expect(stderr).toMatch(/^Error:/);
  });
});
