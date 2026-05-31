# frozen_string_literal: true

module MableBank
  module Application
    class ProcessTransfers
      def initialize(
        account_book:,
        dry_run: false,
        idempotency_registry: nil,
        transfer_journal: nil,
        run_id: nil
      )
        @account_book = account_book
        @dry_run = dry_run
        @idempotency_registry = idempotency_registry
        @transfer_journal = transfer_journal
        @run_id = run_id
      end

      def call(instructions)
        each_result(instructions).to_a
      end

      def each_result(instructions)
        return enum_for(:each_result, instructions) unless block_given?

        instructions.each { |instruction| yield process(instruction) }
      end

      def process(instruction)
        if @idempotency_registry&.seen?(instruction.transfer_id)
          result = Domain::TransferResult.skipped(instruction)
          journal_record(result)
          return result
        end

        result = @dry_run ? @account_book.simulate(instruction) : @account_book.transfer(instruction)
        @idempotency_registry&.register(instruction.transfer_id) if result.success? && !@dry_run
        journal_record(result)
        result
      end

      private

      def journal_record(result)
        return unless @transfer_journal && @run_id

        outcome = if result.success?
                    'succeeded'
                  elsif result.skipped?
                    'skipped'
                  else
                    'failed'
                  end
        @transfer_journal.record(
          TransferJournalEntry.new(
            run_id: @run_id,
            transfer_id: result.instruction.transfer_id,
            outcome: outcome,
            reason_code: result.reason_code&.to_s,
            instruction: result.instruction,
            recorded_at: Time.now.utc
          )
        )
      end
    end
  end
end
