import { describe, expect, it } from 'vitest';
import { AccountNumber } from '../../src/domain/AccountNumber.js';
import { CompanyAccountBook } from '../../src/domain/CompanyAccountBook.js';
import { isTransferFailure, isTransferSuccess } from '../../src/domain/TransferResult.js';
import { Money } from '../../src/domain/Money.js';
import { buildAccount, buildInstruction } from '../support/domainHelpers.js';

function buildBookFromBalances(balances: Record<string, string>): CompanyAccountBook {
  const accounts = Object.entries(balances).map(([number, amount]) =>
    buildAccount(number, amount),
  );
  return new CompanyAccountBook(accounts);
}

function snapshotAmounts(book: CompanyAccountBook): Record<string, string> {
  return Object.fromEntries(
    book.finalBalances().map((snapshot) => [
      snapshot.accountNumber.toString(),
      snapshot.balance.format(),
    ]),
  );
}

function pickTwoAccounts(keys: readonly string[]): [string, string] | undefined {
  if (keys.length < 2) return undefined;
  const from = keys[Math.floor(Math.random() * keys.length)];
  if (from === undefined) return undefined;
  const others = keys.filter((key) => key !== from);
  const to = others[Math.floor(Math.random() * others.length)];
  if (to === undefined) return undefined;
  return [from, to];
}

function assertRandomTransferInvariants(): void {
  const accounts = {
    '1111234522226789': '500.00',
    '1212343433335665': '200.00',
    '2222123433331212': '100.00',
  };
  const book = buildBookFromBalances(accounts);
  const before = snapshotAmounts(book);
  const keys = Object.keys(accounts);
  const pair = pickTwoAccounts(keys);
  if (!pair) return;

  const [from, to] = pair;
  const amounts = ['1.00', '5.00', '10.00', '25.00', '50.00'];
  const amount = amounts[Math.floor(Math.random() * amounts.length)];
  if (amount === undefined) return;

  const result = book.transfer(buildInstruction(from, to, amount));
  const after = snapshotAmounts(book);

  for (const value of Object.values(after)) {
    expect(Money.fromDecimalString(value).isNegative()).toBe(false);
  }

  if (!isTransferSuccess(result)) return;

  const transferAmount = Money.fromDecimalString(amount);
  const fromBefore = before[from];
  const toBefore = before[to];
  if (fromBefore === undefined || toBefore === undefined) return;

  expect(after[from]).toBe(
    Money.fromDecimalString(fromBefore).subtract(transferAmount).format(),
  );
  expect(after[to]).toBe(Money.fromDecimalString(toBefore).add(transferAmount).format());
}

describe('CompanyAccountBook property invariants', () => {
  it('never leaves balances negative after successful transfers', () => {
    for (let index = 0; index < 20; index += 1) {
      assertRandomTransferInvariants();
    }
  });

  it('leaves balances unchanged when transfer fails for insufficient funds', () => {
    const book = buildBookFromBalances({
      '1111234522226789': '10.00',
      '1212343433335665': '0.00',
    });
    const before = snapshotAmounts(book);

    const result = book.transfer(
      buildInstruction('1111234522226789', '1212343433335665', '500.00'),
    );

    expect(isTransferFailure(result)).toBe(true);
    expect(snapshotAmounts(book)).toEqual(before);
  });

  it('does not reflect mutations made to source accounts after registration', () => {
    const mutableAccount = buildAccount('1111234522226789', '500.00');
    const book = new CompanyAccountBook([mutableAccount]);
    mutableAccount.credit(Money.fromDecimalString('999.00'));

    expect(book.balanceFor(AccountNumber.parse('1111234522226789'))?.balance.format()).toBe(
      '500.00',
    );
  });
});
