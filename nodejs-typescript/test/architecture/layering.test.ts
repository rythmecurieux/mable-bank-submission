import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DomainError, InvalidMoneyError, InvariantViolationError } from '../../src/domain/errors.js';

const srcRoot = join(fileURLToPath(new URL('../../src', import.meta.url)));

function listTsFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...listTsFiles(fullPath));
    } else if (entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function filesUnder(segment: string): string[] {
  return listTsFiles(join(srcRoot, segment));
}

function importsForbidden(content: string, pattern: RegExp): boolean {
  return pattern.test(content);
}

describe('Architecture layering', () => {
  it('domain does not import application or infrastructure', () => {
    const violations = filesUnder('domain').filter((path) => {
      const content = readFileSync(path, 'utf8');
      return importsForbidden(content, /from ['"].*\/(application|infrastructure)\//);
    });
    expect(violations).toEqual([]);
  });

  it('application does not import infrastructure', () => {
    const violations = filesUnder('application').filter((path) => {
      const content = readFileSync(path, 'utf8');
      return importsForbidden(content, /from ['"].*\/infrastructure\//);
    });
    expect(violations).toEqual([]);
  });

  it('infrastructure does not import cli', () => {
    const violations = filesUnder('infrastructure').filter((path) => {
      const content = readFileSync(path, 'utf8');
      return importsForbidden(content, /from ['"].*\/cli(\.js|\/)/);
    });
    expect(violations).toEqual([]);
  });

  it('domain errors extend DomainError', () => {
    expect(InvalidMoneyError.prototype).toBeInstanceOf(DomainError);
    expect(InvariantViolationError.prototype).toBeInstanceOf(DomainError);
  });
});
