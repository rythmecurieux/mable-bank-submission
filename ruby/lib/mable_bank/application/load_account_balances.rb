# frozen_string_literal: true

module MableBank
  module Application
    class LoadAccountBalances
      def initialize(reader:)
        @reader = reader
      end

      def call
        book = Domain::CompanyAccountBook.new
        stream_accounts { |account| book.add_account(account) }
        book.ledger = RollingBackLedger.new(book)
        book
      end

      private

      def stream_accounts(&)
        if @reader.respond_to?(:each_account)
          @reader.each_account(&)
        else
          @reader.read.each(&)
        end
      end
    end
  end
end
