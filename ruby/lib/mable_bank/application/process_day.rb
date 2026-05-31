# frozen_string_literal: true

require 'securerandom'

module MableBank
  module Application
    class ProcessDay
      def initialize(balances_reader:, transfers_reader:, dry_run: false, logger: nil, metrics: nil)
        @balances_reader = balances_reader
        @transfers_reader = transfers_reader
        @dry_run = dry_run
        @logger = logger || NullLogger.new
        @metrics = metrics || NullMetrics.new
      end

      def call
        run_id = SecureRandom.uuid
        account_book = LoadAccountBalances.new(reader: @balances_reader).call
        processor, recorder, journal = build_processor(account_book, run_id)

        each_instruction do |instruction|
          result = recorder.record(processor.process(instruction))
          observe_transfer(result)
        end

        Domain::Reconciliation.verify!(account_book) unless @dry_run

        build_report(recorder, account_book, journal, run_id)
      end

      private

      def build_processor(account_book, run_id)
        journal = InMemoryTransferJournal.new
        registry = @dry_run ? nil : InMemoryIdempotencyRegistry.new
        processor = ProcessTransfers.new(
          account_book: account_book,
          dry_run: @dry_run,
          idempotency_registry: registry,
          transfer_journal: journal,
          run_id: run_id
        )
        [processor, TransferResultRecorder.new, journal]
      end

      def build_report(recorder, account_book, journal, run_id)
        ProcessingReport.new(
          recorder: recorder,
          account_book: account_book,
          dry_run: @dry_run,
          transfer_journal: journal,
          run_id: run_id
        )
      end

      def observe_transfer(result)
        outcome = if result.success?
                    'succeeded'
                  elsif result.skipped?
                    'skipped'
                  else
                    'failed'
                  end
        @metrics.increment('transfer.processed', outcome: outcome, reason: result.reason_code)
        @logger.info(
          event: 'transfer.processed',
          outcome: outcome,
          reason_code: result.reason_code,
          transfer_id: result.instruction.transfer_id.to_s,
          from: result.instruction.from_account_number.to_s,
          to: result.instruction.to_account_number.to_s
        )
      end

      def each_instruction(&)
        @transfers_reader.each_instruction(&)
      end
    end
  end
end
