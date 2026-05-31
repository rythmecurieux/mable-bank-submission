import type { Ledger } from './Ledger.js';
import { Account } from './Account.js';
import { AccountBalance } from './AccountBalance.js';
import type { AccountNumber } from './AccountNumber.js';
import { DuplicateAccountError, InvariantViolationError } from './errors.js';
import { NullLedger } from './NullLedger.js';
import type { Money } from './Money.js';
import type { TransferInstruction } from './TransferInstruction.js';
import {
  transferFailure,
  transferSuccess,
  type TransferFailureReason,
  type TransferResult,
} from './TransferResult.js';

export type BalanceSnapshot = ReadonlyMap<AccountNumber, Money>;

export class CompanyAccountBook {
  private readonly accounts = new Map<string, Account>();
  private ledger: Ledger | null = null;

  constructor(accounts: readonly Account[] = []) {
    for (const account of accounts) {
      this.addAccount(account);
    }
  }

  setLedger(ledger: Ledger): void {
    this.ledger = ledger;
  }

  addAccount(account: Account): void {
    const key = account.accountNumber.toString();
    if (this.accounts.has(key)) {
      throw new DuplicateAccountError(`Duplicate account number: ${key}`);
    }
    this.accounts.set(key, this.copyAccount(account));
  }

  private copyAccount(account: Account): Account {
    const AccountClass = account.constructor as typeof Account;
    return new AccountClass(account.accountNumber, account.getBalance());
  }

  transfer(instruction: TransferInstruction): TransferResult {
    const reason = this.evaluate(instruction);
    if (reason !== null) {
      return transferFailure(instruction, reason);
    }

    this.activeLedger.atomic(() => {
      this.apply(instruction);
    });
    return transferSuccess(instruction);
  }

  simulate(instruction: TransferInstruction): TransferResult {
    const reason = this.evaluate(instruction);
    if (reason !== null) {
      return transferFailure(instruction, reason);
    }
    return transferSuccess(instruction);
  }

  balanceFor(accountNumber: AccountNumber): AccountBalance | undefined {
    const account = this.accounts.get(accountNumber.toString());
    if (!account) return undefined;
    return this.snapshotFor(account);
  }

  finalBalances(): AccountBalance[] {
    return [...this.accounts.values()]
      .map((account) => this.snapshotFor(account))
      .sort((left, right) =>
        left.accountNumber.toString().localeCompare(right.accountNumber.toString()),
      );
  }

  captureBalanceSnapshot(): BalanceSnapshot {
    const snapshot = new Map<AccountNumber, Money>();
    for (const account of this.accounts.values()) {
      snapshot.set(account.accountNumber, account.getBalance());
    }
    return snapshot;
  }

  restoreBalanceSnapshot(snapshot: BalanceSnapshot): void {
    for (const [accountNumber, balance] of snapshot) {
      const account = this.accounts.get(accountNumber.toString());
      if (account) {
        account.replaceBalance(balance);
      }
    }
  }

  private get activeLedger(): Ledger {
    return this.ledger ?? new NullLedger();
  }

  private evaluate(instruction: TransferInstruction): TransferFailureReason | null {
    const source = this.accounts.get(instruction.fromAccountNumber.toString());
    if (!source) return 'source_not_found';

    const destination = this.accounts.get(instruction.toAccountNumber.toString());
    if (!destination) return 'destination_not_found';

    if (!source.canDebit(instruction.amount)) return 'insufficient_funds';

    return null;
  }

  private apply(instruction: TransferInstruction): void {
    const source = this.accounts.get(instruction.fromAccountNumber.toString());
    const destination = this.accounts.get(instruction.toAccountNumber.toString());
    if (!source || !destination) {
      throw new InvariantViolationError('apply called without successful evaluation');
    }
    source.debit(instruction.amount);
    destination.credit(instruction.amount);
  }

  private snapshotFor(account: Account): AccountBalance {
    return new AccountBalance(account.accountNumber, account.getBalance());
  }
}
