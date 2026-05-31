# frozen_string_literal: true

RSpec.describe MableBank::Application::TransferResultRecorder do
  let(:instruction) { build_instruction(from: '1111234522226789', to: '1212343433335665', amount: '10.00') }

  it 'counts outcomes without storing every success' do
    recorder = described_class.new
    recorder.record(MableBank::Domain::TransferResult.success(instruction))
    recorder.record(MableBank::Domain::TransferResult.failure(instruction, reason_code: :insufficient_funds))

    expect(recorder.processed_count).to eq(2)
    expect(recorder.succeeded_count).to eq(1)
    expect(recorder.failed_count).to eq(1)
    expect(recorder.failed_results.size).to eq(1)
  end
end
