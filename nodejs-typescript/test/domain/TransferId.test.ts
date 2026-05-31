import { describe, expect, it } from 'vitest';
import { AccountNumber } from '../../src/domain/AccountNumber.js';
import { InvalidTransferInstructionError } from '../../src/domain/errors.js';
import { Money } from '../../src/domain/Money.js';
import { TransferId } from '../../src/domain/TransferId.js';

describe('TransferId', () => {
  it('derives stable ids for the same transfer triple', () => {
    const from = AccountNumber.parse('1111234522226789');
    const to = AccountNumber.parse('1212343433335665');
    const amount = Money.fromDecimalString('10.00');
    const first = TransferId.derive(from, to, amount);
    const second = TransferId.derive(from, to, amount);
    expect(first.equals(second)).toBe(true);
  });

  it('rejects blank customer ids', () => {
    expect(() => TransferId.parse('  ')).toThrow(InvalidTransferInstructionError);
  });
});
