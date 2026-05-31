export class DomainError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class InvalidMoneyError extends DomainError {}

export class InvalidAccountNumberError extends DomainError {}

export class InvalidTransferInstructionError extends DomainError {}

export class DuplicateAccountError extends DomainError {}

export class InsufficientFundsError extends DomainError {}

export class ReconciliationError extends DomainError {}

export class InvariantViolationError extends DomainError {}
