# frozen_string_literal: true

module MableBank
  module Domain
    class Reconciliation
      def self.verify!(account_book)
        account_book.final_balances.each do |snapshot|
          next unless snapshot.balance.amount.negative?

          raise ReconciliationError, "Negative balance on account #{snapshot.account_number}"
        end
      end
    end
  end
end
