import { InvalidMoneyError } from './errors.js';

/** Matches non-negative decimal strings with at most two fractional digits. */
const DECIMAL_PATTERN = /^(?<whole>\d+)(?:\.(?<fraction>\d{1,2}))?$/;

export class Money {
  private constructor(private readonly cents: bigint) {}

  static fromDecimalString(value: string): Money {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new InvalidMoneyError('Money amount cannot be blank');
    }

    if (trimmed.startsWith('-')) {
      throw new InvalidMoneyError('Money amount cannot be negative');
    }

    if (/^\d+\.\d{3,}$/.test(trimmed)) {
      throw new InvalidMoneyError('Money supports at most 2 decimal places');
    }

    const match = DECIMAL_PATTERN.exec(trimmed);
    if (!match?.groups?.whole) {
      throw new InvalidMoneyError(`Invalid money amount: ${value}`);
    }

    const fraction = match.groups.fraction ?? '';
    if (fraction.length > 2) {
      throw new InvalidMoneyError('Money supports at most 2 decimal places');
    }

    const whole = BigInt(match.groups.whole);
    const fractionCents = fraction.length === 0 ? 0n : BigInt(fraction.padEnd(2, '0'));
    const cents = whole * 100n + fractionCents;

    if (cents < 0n) {
      throw new InvalidMoneyError('Money amount cannot be negative');
    }

    return new Money(cents);
  }

  /** Constructs money from minor units (e.g. cents). Used internally and in tests. */
  static fromCents(cents: bigint): Money {
    return new Money(cents);
  }

  static zero(): Money {
    return new Money(0n);
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    return new Money(this.cents - other.cents);
  }

  compare(other: Money): -1 | 0 | 1 {
    if (this.cents < other.cents) return -1;
    if (this.cents > other.cents) return 1;
    return 0;
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }

  isNegative(): boolean {
    return this.cents < 0n;
  }

  isZero(): boolean {
    return this.cents === 0n;
  }

  canSubtract(other: Money): boolean {
    return this.cents >= other.cents;
  }

  format(): string {
    const negative = this.cents < 0n;
    const absolute = negative ? -this.cents : this.cents;
    const dollars = absolute / 100n;
    const centsPart = absolute % 100n;
    const formatted = `${dollars.toString()}.${centsPart.toString().padStart(2, '0')}`;
    return negative ? `-${formatted}` : formatted;
  }
}
