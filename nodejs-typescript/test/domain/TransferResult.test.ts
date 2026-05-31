import { describe, expect, it } from 'vitest';
import {
  isTransferFailure,
  isTransferSuccess,
  transferFailure,
  transferSuccess,
} from '../../src/domain/TransferResult.js';
import { buildInstruction } from '../support/domainHelpers.js';

describe('TransferResult', () => {
  const instruction = buildInstruction('1111234522226789', '1212343433335665', '10.00');

  it('builds success results', () => {
    const result = transferSuccess(instruction);
    expect(isTransferSuccess(result)).toBe(true);
    expect(isTransferFailure(result)).toBe(false);
  });

  it('builds failure results with human-readable messages', () => {
    const result = transferFailure(instruction, 'insufficient_funds');
    expect(isTransferFailure(result)).toBe(true);
    if (isTransferFailure(result)) {
      expect(result.reason).toBe('insufficient_funds');
      expect(result.message).toBe('Insufficient funds');
    }
  });
});
