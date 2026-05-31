# frozen_string_literal: true

module MableBank
  module Domain
    class TransferInstruction
      attr_reader :transfer_id, :from_account_number, :to_account_number, :amount

      def initialize(from_account_number:, to_account_number:, amount:, transfer_id: nil)
        @from_account_number = from_account_number
        @to_account_number = to_account_number
        @amount = amount
        @transfer_id = transfer_id || TransferId.derive(
          from_account_number: from_account_number,
          to_account_number: to_account_number,
          amount: amount
        )

        validate!
      end

      private

      def validate!
        raise InvalidTransferInstructionError, 'Source account number is required' if from_account_number.nil?
        raise InvalidTransferInstructionError, 'Destination account number is required' if to_account_number.nil?
        raise InvalidTransferInstructionError, 'Transfer amount is required' if amount.nil?
        raise InvalidTransferInstructionError, 'Transfer amount must be positive' if amount.amount.zero?
        raise InvalidTransferInstructionError, 'Source and destination accounts must differ' if same_account?
      end

      def same_account?
        from_account_number == to_account_number
      end
    end
  end
end
