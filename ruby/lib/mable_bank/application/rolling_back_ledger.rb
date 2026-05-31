# frozen_string_literal: true

module MableBank
  module Application
    # Synchronous transactional boundary: on any error during apply, restore pre-transfer balances.
    class RollingBackLedger
      include Ledger

      def initialize(account_book)
        @account_book = account_book
      end

      def atomic
        snapshot = @account_book.capture_balance_snapshot
        yield
      rescue StandardError
        @account_book.restore_balance_snapshot(snapshot)
        raise
      end
    end
  end
end
