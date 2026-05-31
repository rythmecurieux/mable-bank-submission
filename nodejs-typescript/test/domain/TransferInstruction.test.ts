import { describe, expect, it } from 'vitest';
import { AccountNumber } from '../../src/domain/AccountNumber.js';
import { InvalidTransferInstructionError } from '../../src/domain/errors.js';
import { Money } from '../../src/domain/Money.js';
import { createTransferInstruction } from '../../src/domain/TransferInstruction.js';

describe('TransferInstruction', () => {
  it('rejects zero amounts and self transfers', () => {
    expect(() =>
      createTransferInstruction({
        fromAccountNumber: AccountNumber.parse('1111234522226789'),
        toAccountNumber: AccountNumber.parse('1212343433335665'),
        amount: Money.fromDecimalString('0.00'),
      }),
    ).toThrow(InvalidTransferInstructionError);

    expect(() =>
      createTransferInstruction({
        fromAccountNumber: AccountNumber.parse('1111234522226789'),
        toAccountNumber: AccountNumber.parse('1111234522226789'),
        amount: Money.fromDecimalString('1.00'),
      }),
    ).toThrow(/must differ/);
  });
});
