# frozen_string_literal: true

module MableBank
  module Infrastructure
    class ConsoleReporter
      def report(processing_report)
        [
          header_line(processing_report),
          '',
          summary_line(processing_report),
          '',
          'Final balances:',
          *balance_lines(processing_report.final_balances),
          *failed_transfer_lines(processing_report.failed_results)
        ].compact.join("\n")
      end

      private

      def header_line(processing_report)
        processing_report.dry_run? ? 'Mable Bank Transfer Processing (dry run)' : 'Mable Bank Transfer Processing'
      end

      def balance_lines(final_balances)
        final_balances.map do |account_balance|
          "#{account_balance.account_number}: #{MoneyFormatter.format(account_balance.balance)}"
        end
      end

      def failed_transfer_lines(failed_results)
        return [] if failed_results.empty?

        ['', 'Failed transfers:', *failed_results.map.with_index(1) { |result, index| failure_line(index, result) }]
      end

      def failure_line(index, result)
        instruction = result.instruction
        format(
          '%<index>d. From %<from>s to %<to>s for %<amount>s - %<reason>s',
          index: index,
          from: instruction.from_account_number,
          to: instruction.to_account_number,
          amount: MoneyFormatter.format(instruction.amount),
          reason: result.reason
        )
      end

      def summary_line(processing_report)
        lines = [
          "Transfers processed: #{processing_report.processed_count}",
          "Successful transfers: #{processing_report.succeeded_count}",
          "Failed transfers: #{processing_report.failed_count}"
        ]
        if processing_report.skipped_count.positive?
          lines << "Skipped transfers (already processed): #{processing_report.skipped_count}"
        end
        lines << 'No balances were mutated during dry run.' if processing_report.dry_run?
        lines.join("\n")
      end
    end
  end
end
