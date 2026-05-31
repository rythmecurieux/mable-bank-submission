import { describe, expect, it } from 'vitest';
import { parseCsvLine } from '../../src/infrastructure/csv.js';

describe('parseCsvLine', () => {
  it('parses quoted fields with commas and escaped quotes', () => {
    expect(parseCsvLine('"a,b",c')).toEqual(['a,b', 'c']);
    expect(parseCsvLine('"say ""hi""",x')).toEqual(['say "hi"', 'x']);
  });
});
