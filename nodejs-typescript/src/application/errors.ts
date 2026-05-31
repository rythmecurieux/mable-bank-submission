/** Root error for application-layer failures. */
export class MableBankError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class LoadAccountBalancesError extends MableBankError {
  constructor(message: string) {
    super(message);
  }
}
