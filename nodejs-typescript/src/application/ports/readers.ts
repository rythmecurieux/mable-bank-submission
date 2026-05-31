import type { Account } from '../../domain/Account.js';
import type { TransferInstruction } from '../../domain/TransferInstruction.js';

/** Port: stream opening balances into the domain. */
export interface AccountBalanceReader {
  eachAccount(callback: (account: Account) => void): void;
}

/** Port: stream transfer instructions for a processing day. */
export interface TransferInstructionReader {
  eachInstruction(callback: (instruction: TransferInstruction) => void): void;
}
