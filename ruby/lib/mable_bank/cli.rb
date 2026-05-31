# frozen_string_literal: true

require 'optparse'

module MableBank
  class CLI
    USAGE = 'Usage: mable_bank [--dry-run] <account_balances.csv> <transactions.csv>'
    EXIT_OK = 0
    EXIT_ERROR = 1
    EXIT_USAGE = 2

    Options = Data.define(:dry_run, :balances_path, :transactions_path)

    def self.run(argv)
      new(argv).run
    end

    def initialize(argv)
      @argv = argv.dup
    end

    def run
      options = parse_options
      unless options
        warn USAGE
        return EXIT_ERROR
      end

      report = run_processing_day(options)
      $stdout.puts Infrastructure::ConsoleReporter.new.report(report)
      EXIT_OK
    rescue Error => e
      warn "Error: #{e.message}"
      EXIT_ERROR
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

    private

    def parse_options
      dry_run = false
      parser = OptionParser.new do |opts|
        opts.banner = USAGE
        opts.on('--dry-run', 'Simulate transfers without mutating balances') { dry_run = true }
        opts.on('-h', '--help', 'Show this message') do
          puts opts
          exit EXIT_USAGE
        end
      end

      parser.parse!(@argv)
      balances_path, transactions_path = @argv

      return nil if balances_path.to_s.empty? || transactions_path.to_s.empty?

      Options.new(dry_run: dry_run, balances_path: balances_path, transactions_path: transactions_path)
    rescue OptionParser::InvalidOption => e
      warn e.message
      warn USAGE
      nil
    end
  end
end
