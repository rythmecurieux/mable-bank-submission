import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
});
