# frozen_string_literal: true

RSpec.describe MableBank::Application::ProcessDay do
  include_context 'with fixture csv paths'

  let(:logger) { MableBank::Application::RecordingLogger.new }
  let(:metrics) { MableBank::Application::RecordingMetrics.new }

  # Mirrors dotnet ProcessDayObservabilityTests: one contract assertion block.
  # rubocop:disable RSpec/ExampleLength, RSpec/MultipleExpectations
  it 'records ADR 005 wire contract for each transfer' do
    described_class.new(
      balances_reader: MableBank::Infrastructure::CsvAccountBalanceReader.new(balances_path),
      transfers_reader: MableBank::Infrastructure::CsvTransferInstructionReader.new(transactions_path),
      logger: logger,
      metrics: metrics
    ).call

    expect(metrics.records.size).to eq(4)
    expect(metrics.increments.size).to eq(4)
    expect(metrics.increments).to all(
      have_attributes(name: MableBank::Application::Telemetry::TransferProcessedTelemetry::METRIC_NAME)
    )
    expect(metrics.increments).to all(have_attributes(outcome: 'succeeded', reason: nil))

    expect(logger.wire_entries.size).to eq(4)
    expect(logger.wire_entries).to all(
      have_attributes(event: MableBank::Application::Telemetry::TransferProcessedTelemetry::EVENT_NAME)
    )

    first = logger.wire_entries.first
    expect(first.outcome).to eq('succeeded')
    expect(first.from).to eq('1111234522226789')
    expect(first.to).to eq('1212343433335665')
    expect(first.transfer_id).not_to be_empty
  end
  # rubocop:enable RSpec/ExampleLength, RSpec/MultipleExpectations
end
