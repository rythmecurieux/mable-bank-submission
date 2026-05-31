# frozen_string_literal: true

RSpec.describe MableBank::Application::ProcessDay do
  let(:balances_path) { File.expand_path('../fixtures/mable_account_balances.csv', __dir__) }
  let(:transactions_path) { File.expand_path('../fixtures/mable_transactions.csv', __dir__) }
  let(:logger) { MableBank::Application::RecordingLogger.new }
  let(:metrics) { MableBank::Application::RecordingMetrics.new }

  it 'records metrics and log entries for each transfer' do
    described_class.new(
      balances_reader: MableBank::Infrastructure::CsvAccountBalanceReader.new(balances_path),
      transfers_reader: MableBank::Infrastructure::CsvTransferInstructionReader.new(transactions_path),
      logger: logger,
      metrics: metrics
    ).call

    expect(metrics.increments.size).to eq(4)
    expect(metrics.increments).to all(include(name: 'transfer.processed'))
    expect(logger.entries.size).to eq(4)
    expect(logger.entries.first).to include(event: 'transfer.processed', outcome: 'succeeded')
  end
end
