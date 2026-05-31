# frozen_string_literal: true

module MableBank
  module Domain
    class TransferResult
      REASONS = {
        TransferFailureReason::SOURCE_NOT_FOUND => 'Source account not found',
        TransferFailureReason::DESTINATION_NOT_FOUND => 'Destination account not found',
        TransferFailureReason::INSUFFICIENT_FUNDS => 'Insufficient funds',
        already_processed: 'Transfer already processed'
      }.freeze

      attr_reader :instruction, :reason, :reason_code

      def self.success(instruction)
        new(instruction: instruction, status: :succeeded)
      end

      def self.failure(instruction, reason_code:)
        new(
          instruction: instruction,
          status: :failed,
          reason_code: reason_code,
          reason: REASONS.fetch(reason_code)
        )
      end

      def self.skipped(instruction, reason_code: :already_processed)
        new(
          instruction: instruction,
          status: :skipped,
          reason_code: reason_code,
          reason: REASONS.fetch(reason_code)
        )
      end

      def initialize(instruction:, status:, reason_code: nil, reason: nil)
        @instruction = instruction
        @status = status
        @reason_code = reason_code
        @reason = reason
      end

      def success?
        @status == :succeeded
      end

      def failure?
        @status == :failed
      end

      def skipped?
        @status == :skipped
      end
    end
  end
end
