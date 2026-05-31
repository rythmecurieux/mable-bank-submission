# frozen_string_literal: true

RSpec.describe MableBank::Application::Telemetry::TransferProcessedTelemetry do
  let(:instruction) { build_instruction(from: '1111234522226789', to: '1212343433335665', amount: '10.00') }

  it 'maps success to ADR wire format' do
    telemetry = described_class.from_result(MableBank::Domain::TransferResult.success(instruction))

    expect(telemetry.outcome).to eq('succeeded')
    expect(telemetry.reason_code).to be_nil
    expect(telemetry.to_log_entry).to have_attributes(
      event: described_class::EVENT_NAME,
      outcome: 'succeeded',
      reason_code: nil,
      from: '1111234522226789',
      to: '1212343433335665'
    )
    expect(telemetry.to_metric_increment).to have_attributes(
      name: described_class::METRIC_NAME,
      outcome: 'succeeded',
      reason: nil
    )
  end

  it 'maps failure reason codes to log and metric tags' do
    telemetry = described_class.from_result(
      MableBank::Domain::TransferResult.failure(
        instruction,
        reason_code: MableBank::Domain::TransferFailureReason::SOURCE_NOT_FOUND
      )
    )

    expect(telemetry.outcome).to eq('failed')
    expect(telemetry.reason_code).to eq('source_not_found')
    expect(telemetry.to_log_entry.reason_code).to eq('source_not_found')
    expect(telemetry.to_metric_increment.reason).to eq('source_not_found')
  end

  it 'maps skipped transfers to skipped wire format' do
    telemetry = described_class.from_result(MableBank::Domain::TransferResult.skipped(instruction))

    expect(telemetry.outcome).to eq('skipped')
    expect(telemetry.reason_code).to eq('already_processed')
  end
end
