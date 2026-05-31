# frozen_string_literal: true

module MableBank
  module Application
    # Records transfer outcomes incrementally (sync). Retains failures for reporting, not every success.
    class TransferResultRecorder
      attr_reader :failed_results, :processed_count, :succeeded_count, :failed_count, :skipped_count

      def initialize
        @processed_count = 0
        @succeeded_count = 0
        @failed_count = 0
        @skipped_count = 0
        @failed_results = []
      end

      def record(result)
        @processed_count += 1
        if result.success?
          @succeeded_count += 1
        elsif result.skipped?
          @skipped_count += 1
        elsif result.failure?
          @failed_count += 1
          @failed_results << result
        end
        result
      end
    end
  end
end
