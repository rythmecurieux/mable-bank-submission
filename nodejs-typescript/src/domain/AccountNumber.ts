import { InvalidAccountNumberError } from './errors.js';

const ACCOUNT_NUMBER_PATTERN = /^\d{16}$/;

export class AccountNumber {
  private constructor(private readonly value: string) {}

  static parse(value: string): AccountNumber {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new InvalidAccountNumberError('Account number cannot be blank');
    }
    if (!/^\d+$/.test(trimmed)) {
      throw new InvalidAccountNumberError('Account number must contain only digits');
    }
    if (!ACCOUNT_NUMBER_PATTERN.test(trimmed)) {
      throw new InvalidAccountNumberError('Account number must be exactly 16 digits');
    }
    return new AccountNumber(trimmed);
  }

  toString(): string {
    return this.value;
  }

  equals(other: AccountNumber): boolean {
    return this.value === other.value;
  }
}
