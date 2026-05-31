# frozen_string_literal: true

module MableBank
  module Domain
    class DomainError < MableBank::Error; end

    class InvalidAccountNumberError < DomainError; end
    class InvalidMoneyAmountError < DomainError; end
    class InsufficientFundsError < DomainError; end
    class InvalidTransferInstructionError < DomainError; end
    class DuplicateAccountError < DomainError; end
    class ReconciliationError < DomainError; end
    class InvariantViolationError < DomainError; end
  end
end
