import { Account } from '../../src/domain/Account.js';
import { AccountNumber } from '../../src/domain/AccountNumber.js';
import { CompanyAccountBook } from '../../src/domain/CompanyAccountBook.js';
import {
  createTransferInstruction,
  type TransferInstruction,
} from '../../src/domain/TransferInstruction.js';
import { Money } from '../../src/domain/Money.js';
import { formatMoney } from '../../src/infrastructure/MoneyFormatter.js';

export function buildAccount(number: string, balance: string): Account {
  return new Account(AccountNumber.parse(number), Money.fromDecimalString(balance));
}

export function buildInstruction(from: string, to: string, amount: string): TransferInstruction {
  return createTransferInstruction({
    fromAccountNumber: AccountNumber.parse(from),
    toAccountNumber: AccountNumber.parse(to),
    amount: Money.fromDecimalString(amount),
  });
}

export function exampleAccountBook(): CompanyAccountBook {
  return new CompanyAccountBook([
    buildAccount('1111234522226789', '5000.00'),
    buildAccount('1111234522221234', '10000.00'),
    buildAccount('2222123433331212', '550.00'),
    buildAccount('1212343433335665', '1200.00'),
    buildAccount('3212343433335755', '50000.00'),
  ]);
}

export function balanceAmount(book: CompanyAccountBook, accountNumber: string): string {
  const snapshot = book.balanceFor(AccountNumber.parse(accountNumber));
  if (!snapshot) {
    throw new Error(`Account not found: ${accountNumber}`);
  }
  return formatMoney(snapshot.balance);
}
