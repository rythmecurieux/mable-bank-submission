# frozen_string_literal: true

module MableBank
  module Domain
    class AccountBalance
      attr_reader :account_number, :balance

      def initialize(account_number:, balance:)
        @account_number = account_number
        @balance = balance
      end
    end
  end
end
