# frozen_string_literal: true

module MableBank
  module Domain
    class Account
      attr_reader :account_number, :balance

      def initialize(account_number:, balance:)
        @account_number = account_number
        @balance = balance
      end

      def credit(amount)
        @balance = balance + amount
      end

      def debit!(amount)
        raise InsufficientFundsError, 'Insufficient funds' unless can_debit?(amount)

        @balance = balance - amount
      end

      def can_debit?(amount)
        balance.amount >= amount.amount
      end

      # Used only when a transfer apply must roll back (see Infrastructure::RollingBackLedger).
      def replace_balance!(money)
        @balance = money
      end
    end
  end
end
