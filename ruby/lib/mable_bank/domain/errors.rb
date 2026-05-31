# frozen_string_literal: true

module MableBank
  module Domain
    class DomainError < StandardError; end

    class InvalidAccountNumberError < DomainError; end
    class InvalidMoneyAmountError < DomainError; end
    class AccountNotFoundError < DomainError; end
    class InsufficientFundsError < DomainError; end
    class InvalidTransferInstructionError < DomainError; end
    class DuplicateAccountError < DomainError; end
    class ReconciliationError < DomainError; end
  end
end
