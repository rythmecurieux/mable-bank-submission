# frozen_string_literal: true

require 'csv'

module MableBank
  module Infrastructure
    class CsvTransferInstructionReader
      class ParseError < StandardError; end

      def initialize(path)
        @path = path
      end

      def each_instruction
        return enum_for(:each_instruction) unless block_given?

        CSV.foreach(@path, headers: true).with_index(2) do |row, row_number|
          yield parse_row(row, row_number)
        end
      rescue Errno::ENOENT
        raise ParseError, "Transactions file not found: #{@path}"
      rescue CSV::MalformedCSVError => e
        raise ParseError, "Malformed transactions CSV: #{e.message}"
      end

      def read
        each_instruction.to_a
      end

      private

      def parse_row(row, row_number)
        from_value = row['From']
        to_value = row['To']
        amount_value = row['Amount']

        if from_value.nil? || to_value.nil? || amount_value.nil?
          raise ParseError, "Row #{row_number}: missing From, To, or Amount"
        end

        from_account_number = Domain::AccountNumber.new(from_value)
        to_account_number = Domain::AccountNumber.new(to_value)
        amount = Domain::Money.new(amount_value)

        transfer_id = optional_transfer_id(row['TransferId'])

        Domain::TransferInstruction.new(
          from_account_number: from_account_number,
          to_account_number: to_account_number,
          amount: amount,
          transfer_id: transfer_id
        )
      rescue Domain::InvalidAccountNumberError, Domain::InvalidMoneyAmountError,
             Domain::InvalidTransferInstructionError => e
        raise ParseError, "Row #{row_number}: #{e.message}"
      end

      def optional_transfer_id(value)
        return nil if value.nil? || value.strip.empty?

        Domain::TransferId.parse(value)
      end
    end
  end
end
