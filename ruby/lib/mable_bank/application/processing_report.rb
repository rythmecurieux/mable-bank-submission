# frozen_string_literal: true

module MableBank
  module Application
    class ProcessingReport
      attr_reader :recorder, :dry_run, :transfer_journal, :run_id

      def initialize(recorder:, account_book:, dry_run: false, transfer_journal: nil, run_id: nil)
        @recorder = recorder
        @account_book = account_book
        @dry_run = dry_run
        @transfer_journal = transfer_journal
        @run_id = run_id
      end

      def final_balances
        @account_book.final_balances
      end

      def dry_run?
        @dry_run
      end

      def processed_count
        @recorder.processed_count
      end

      def succeeded_count
        @recorder.succeeded_count
      end

      def failed_count
        @recorder.failed_count
      end

      def failed_results
        @recorder.failed_results
      end

      def skipped_count
        @recorder.skipped_count
      end

      def journal_entries
        @transfer_journal&.entries || []
      end
    end
  end
end
