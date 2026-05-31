# frozen_string_literal: true

RSpec.describe MableBank::Application::TransferOutcome do
  let(:instruction) { build_instruction(from: '1111234522226789', to: '1212343433335665', amount: '1.00') }

  it 'maps succeeded, failed, and skipped results to wire names' do
    expect(described_class.wire_name(MableBank::Domain::TransferResult.success(instruction))).to eq('succeeded')
    expect(
      described_class.wire_name(
        MableBank::Domain::TransferResult.failure(instruction, reason_code: :insufficient_funds)
      )
    ).to eq('failed')
    expect(described_class.wire_name(MableBank::Domain::TransferResult.skipped(instruction))).to eq('skipped')
  end
end
