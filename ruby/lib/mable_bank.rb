# frozen_string_literal: true

require_relative 'mable_bank/domain/errors'
require_relative 'mable_bank/domain/money'
require_relative 'mable_bank/domain/account_number'
require_relative 'mable_bank/domain/account'
require_relative 'mable_bank/domain/account_balance'
require_relative 'mable_bank/domain/transfer_id'
require_relative 'mable_bank/domain/transfer_instruction'
require_relative 'mable_bank/domain/transfer_result'
require_relative 'mable_bank/domain/reconciliation'
require_relative 'mable_bank/domain/null_ledger'
require_relative 'mable_bank/domain/company_account_book'

require_relative 'mable_bank/application/ledger'
require_relative 'mable_bank/application/rolling_back_ledger'
require_relative 'mable_bank/application/idempotency_registry'
require_relative 'mable_bank/application/transfer_journal'
require_relative 'mable_bank/application/transfer_result_recorder'
require_relative 'mable_bank/application/null_logger'
require_relative 'mable_bank/application/recording_logger'
require_relative 'mable_bank/application/null_metrics'
require_relative 'mable_bank/application/recording_metrics'
require_relative 'mable_bank/application/load_account_balances'
require_relative 'mable_bank/application/process_transfers'
require_relative 'mable_bank/application/process_day'
require_relative 'mable_bank/application/processing_report'

require_relative 'mable_bank/infrastructure/input_file'
require_relative 'mable_bank/infrastructure/csv_account_balance_reader'
require_relative 'mable_bank/infrastructure/csv_transfer_instruction_reader'
require_relative 'mable_bank/infrastructure/money_formatter'
require_relative 'mable_bank/infrastructure/console_reporter'

module MableBank
  class CLI
    USAGE = 'Usage: mable_bank [--dry-run] <account_balances.csv> <transactions.csv>'

    Options = Struct.new(:dry_run, :balances_path, :transactions_path, keyword_init: true) do
      def valid?
        balances_path && transactions_path
      end
    end

    def self.run(argv)
      new(argv).run
    end

    def initialize(argv)
      @argv = argv.dup
    end

    def run
      options = parse_options
      return usage_error unless options.valid?

      report = run_processing_day(options)
      puts Infrastructure::ConsoleReporter.new.report(report)

      0
    rescue Infrastructure::CsvAccountBalanceReader::ParseError,
           Infrastructure::CsvTransferInstructionReader::ParseError,
           Infrastructure::InputFile::ValidationError,
           Domain::DuplicateAccountError,
           Domain::ReconciliationError => e
      warn "Error: #{e.message}"
      1
    end

    private

    def parse_options
      dry_run = @argv.delete('--dry-run') ? true : false
      balances_path, transactions_path = @argv

      Options.new(dry_run: dry_run, balances_path: balances_path, transactions_path: transactions_path)
    end

    def usage_error
      warn USAGE
      1
    end

    def run_processing_day(options)
      balances_path = Infrastructure::InputFile.validate!(options.balances_path)
      transactions_path = Infrastructure::InputFile.validate!(options.transactions_path)

      Application::ProcessDay.new(
        balances_reader: Infrastructure::CsvAccountBalanceReader.new(balances_path),
        transfers_reader: Infrastructure::CsvTransferInstructionReader.new(transactions_path),
        dry_run: options.dry_run
      ).call
    end
  end
end
