# frozen_string_literal: true

module MableBank
  module Domain
    class Account
      attr_reader :account_number, :balance

      def initialize(account_number:, balance:, credit_policy: DefaultCreditPolicy.new)
        @account_number = account_number
        @balance = balance
        @credit_policy = credit_policy
      end

      def credit(amount)
        @balance = @credit_policy.apply_credit(@balance, amount)
      end

      def debit!(amount)
        raise InsufficientFundsError, 'Insufficient funds' unless can_debit?(amount)

        @balance = balance - amount
      end

      def can_debit?(amount)
        balance.amount >= amount.amount
      end

      def copy
        self.class.new(account_number: account_number, balance: balance, credit_policy: @credit_policy)
      end

      # Used only when a transfer apply must roll back (see Application::RollingBackLedger).
      def replace_balance!(money)
        @balance = money
      end
    end
  end
end
