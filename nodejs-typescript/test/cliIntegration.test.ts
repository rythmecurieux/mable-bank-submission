import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixturesDir = join(projectRoot, 'test', 'fixtures');

describe('CLI subprocess integration', () => {
  it('runs bin/mable-bank.ts against fixtures', () => {
    const result = spawnSync(
      process.execPath,
      [
        '--import',
        'tsx',
        join(projectRoot, 'bin', 'mable-bank.ts'),
        join(fixturesDir, 'mable_account_balances.csv'),
        join(fixturesDir, 'mable_transactions.csv'),
      ],
      {
        cwd: projectRoot,
        encoding: 'utf8',
        env: process.env,
      },
    );

    expect(result.status).toBe(0);
    const output = `${result.stdout}\n${result.stderr}`;
    expect(output).toContain('1111234522226789: 4820.50');
    expect(output).toContain('Successful transfers: 4');
  });
});
