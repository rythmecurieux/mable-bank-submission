# frozen_string_literal: true

module MableBank
  module Application
    module Telemetry
      TransferProcessedLogEntry = Data.define(:event, :outcome, :reason_code, :transfer_id, :from, :to)
      MetricIncrement = Data.define(:name, :outcome, :reason)

      class TransferProcessedTelemetry
        METRIC_NAME = 'transfer.processed'
        EVENT_NAME = 'transfer.processed'

        attr_reader :outcome, :reason_code, :transfer_id, :from, :to

        def self.from_result(result)
          outcome = if result.success?
                      'succeeded'
                    elsif result.skipped?
                      'skipped'
                    else
                      'failed'
                    end
          new(
            outcome: outcome,
            reason_code: result.reason_code&.to_s,
            transfer_id: result.instruction.transfer_id.to_s,
            from: result.instruction.from_account_number.to_s,
            to: result.instruction.to_account_number.to_s
          )
        end

        def initialize(outcome:, reason_code:, transfer_id:, from:, to:)
          @outcome = outcome
          @reason_code = reason_code
          @transfer_id = transfer_id
          @from = from
          @to = to
        end

        def to_log_entry
          TransferProcessedLogEntry.new(
            event: EVENT_NAME,
            outcome: @outcome,
            reason_code: @reason_code,
            transfer_id: @transfer_id,
            from: @from,
            to: @to
          )
        end

        def to_metric_increment
          MetricIncrement.new(name: METRIC_NAME, outcome: @outcome, reason: @reason_code)
        end
      end
    end
  end
end
