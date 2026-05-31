# frozen_string_literal: true

require 'csv'

module MableBank
  module Infrastructure
    class CsvAccountBalanceReader
      class ParseError < StandardError; end

      def initialize(path)
        @path = path
      end

      def each_account
        return enum_for(:each_account) unless block_given?

        CSV.foreach(@path, headers: true).with_index(2) do |row, row_number|
          yield parse_row(row, row_number)
        end
      rescue Errno::ENOENT
        raise ParseError, "Account balances file not found: #{@path}"
      rescue CSV::MalformedCSVError => e
        raise ParseError, "Malformed account balances CSV: #{e.message}"
      end

      def read
        each_account.to_a
      end

      private

      def parse_row(row, row_number)
        account_value = row['Account']
        balance_value = row['Balance']

        raise ParseError, "Row #{row_number}: missing Account or Balance" if account_value.nil? || balance_value.nil?

        account_number = Domain::AccountNumber.new(account_value)
        balance = Domain::Money.new(balance_value)

        Domain::Account.new(account_number: account_number, balance: balance)
      rescue Domain::InvalidAccountNumberError, Domain::InvalidMoneyAmountError => e
        raise ParseError, "Row #{row_number}: #{e.message}"
      end
    end
  end
end
