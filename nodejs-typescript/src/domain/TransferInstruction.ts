import type { AccountNumber } from './AccountNumber.js';
import { InvalidTransferInstructionError } from './errors.js';
import type { Money } from './Money.js';
import { TransferId } from './TransferId.js';

export type TransferInstruction = {
  readonly transferId: TransferId;
  readonly fromAccountNumber: AccountNumber;
  readonly toAccountNumber: AccountNumber;
  readonly amount: Money;
};

export function createTransferInstruction(input: {
  fromAccountNumber: AccountNumber;
  toAccountNumber: AccountNumber;
  amount: Money;
  transferId?: TransferId;
}): TransferInstruction {
  if (input.amount.isZero()) {
    throw new InvalidTransferInstructionError('Transfer amount must be positive');
  }
  if (input.fromAccountNumber.equals(input.toAccountNumber)) {
    throw new InvalidTransferInstructionError('Source and destination accounts must differ');
  }
  const transferId =
    input.transferId ??
    TransferId.derive(input.fromAccountNumber, input.toAccountNumber, input.amount);
  return {
    transferId,
    fromAccountNumber: input.fromAccountNumber,
    toAccountNumber: input.toAccountNumber,
    amount: input.amount,
  };
}
