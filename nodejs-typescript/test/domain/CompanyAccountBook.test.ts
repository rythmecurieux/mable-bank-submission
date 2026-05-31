import { describe, expect, it } from 'vitest';
import { AccountBalance } from '../../src/domain/AccountBalance.js';
import { AccountNumber } from '../../src/domain/AccountNumber.js';
import { CompanyAccountBook } from '../../src/domain/CompanyAccountBook.js';
import { DuplicateAccountError } from '../../src/domain/errors.js';
import { isTransferFailure, isTransferSuccess } from '../../src/domain/TransferResult.js';
import {
  balanceAmount,
  buildAccount,
  buildInstruction,
} from '../support/domainHelpers.js';

describe('CompanyAccountBook', () => {
  const book = new CompanyAccountBook([
    buildAccount('1111234522226789', '500.00'),
    buildAccount('1212343433335665', '100.00'),
    buildAccount('2222123433331212', '50.00'),
  ]);

  it('exposes read-only balance snapshots', () => {
    const snapshot = book.balanceFor(AccountNumber.parse('1111234522226789'));
    expect(snapshot).toBeInstanceOf(AccountBalance);
    expect(snapshot?.balance.format()).toBe('500.00');
  });

  it('returns undefined for unknown accounts', () => {
    expect(book.balanceFor(AccountNumber.parse('9999999999999999'))).toBeUndefined();
  });

  it('rejects duplicate account numbers', () => {
    expect(
      () =>
        new CompanyAccountBook([
          buildAccount('1111234522226789', '500.00'),
          buildAccount('1111234522226789', '200.00'),
        ]),
    ).toThrow(DuplicateAccountError);
  });

  describe('transfer', () => {
    const instruction = buildInstruction('1111234522226789', '1212343433335665', '100.00');

    it('processes successful transfer', () => {
      expect(isTransferSuccess(book.transfer(instruction))).toBe(true);
    });

    it('debits source account', () => {
      const localBook = new CompanyAccountBook([
        buildAccount('1111234522226789', '500.00'),
        buildAccount('1212343433335665', '100.00'),
        buildAccount('2222123433331212', '50.00'),
      ]);
      localBook.transfer(instruction);
      expect(balanceAmount(localBook, '1111234522226789')).toBe('400.00');
    });

    it('credits destination account', () => {
      const localBook = new CompanyAccountBook([
        buildAccount('1111234522226789', '500.00'),
        buildAccount('1212343433335665', '100.00'),
        buildAccount('2222123433331212', '50.00'),
      ]);
      localBook.transfer(instruction);
      expect(balanceAmount(localBook, '1212343433335665')).toBe('200.00');
    });

    it('rejects insufficient funds', () => {
      const result = book.transfer(
        buildInstruction('1111234522226789', '1212343433335665', '500.01'),
      );
      expect(isTransferFailure(result)).toBe(true);
      if (isTransferFailure(result)) {
        expect(result.reason).toBe('insufficient_funds');
      }
    });

    it('handles missing source account', () => {
      const result = book.transfer(
        buildInstruction('9999999999999991', '1212343433335665', '10.00'),
      );
      expect(isTransferFailure(result)).toBe(true);
      if (isTransferFailure(result)) {
        expect(result.reason).toBe('source_not_found');
      }
    });

    it('handles missing destination account', () => {
      const result = book.transfer(
        buildInstruction('1111234522226789', '9999999999999992', '10.00'),
      );
      expect(isTransferFailure(result)).toBe(true);
      if (isTransferFailure(result)) {
        expect(result.reason).toBe('destination_not_found');
      }
    });

    it('leaves balances unchanged on failed transfer', () => {
      const localBook = new CompanyAccountBook([
        buildAccount('1111234522226789', '500.00'),
        buildAccount('1212343433335665', '100.00'),
        buildAccount('2222123433331212', '50.00'),
      ]);
      localBook.transfer(buildInstruction('1111234522226789', '1212343433335665', '500.01'));
      expect(balanceAmount(localBook, '1111234522226789')).toBe('500.00');
      expect(balanceAmount(localBook, '1212343433335665')).toBe('100.00');
    });

    it('simulates transfers without mutating balances', () => {
      const localBook = new CompanyAccountBook([
        buildAccount('1111234522226789', '500.00'),
        buildAccount('1212343433335665', '100.00'),
        buildAccount('2222123433331212', '50.00'),
      ]);
      const result = localBook.simulate(instruction);
      expect(isTransferSuccess(result)).toBe(true);
      expect(balanceAmount(localBook, '1111234522226789')).toBe('500.00');
      expect(balanceAmount(localBook, '1212343433335665')).toBe('100.00');
    });
  });

  describe('finalBalances', () => {
    it('returns deterministic final balances sorted by account number', () => {
      const localBook = new CompanyAccountBook([
        buildAccount('1111234522226789', '500.00'),
        buildAccount('1212343433335665', '100.00'),
        buildAccount('2222123433331212', '50.00'),
      ]);
      localBook.transfer(buildInstruction('1111234522226789', '1212343433335665', '25.00'));

      const balances = localBook.finalBalances();
      expect(balances.map((snapshot) => snapshot.accountNumber.toString())).toEqual([
        '1111234522226789',
        '1212343433335665',
        '2222123433331212',
      ]);
      expect(balances.map((snapshot) => snapshot.balance.format())).toContain('475.00');
      expect(balances.map((snapshot) => snapshot.balance.format())).toContain('125.00');
    });
  });
});
