import { createHash } from 'node:crypto';
import type { AccountNumber } from './AccountNumber.js';
import { InvalidTransferInstructionError } from './errors.js';
import type { Money } from './Money.js';

export class TransferId {
  private constructor(readonly value: string) {}

  static derive(from: AccountNumber, to: AccountNumber, amount: Money): TransferId {
    const key = `${from.toString()}|${to.toString()}|${amount.format()}`;
    const hash = createHash('sha256').update(key, 'utf8').digest('hex');
    return new TransferId(hash);
  }

  static parse(value: string): TransferId {
    if (!value.trim()) {
      throw new InvalidTransferInstructionError('Transfer id cannot be blank');
    }
    return new TransferId(value.trim());
  }

  equals(other: TransferId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
