# frozen_string_literal: true

RSpec.describe MableBank::Domain::TransferResult do
  let(:instruction) do
    build_instruction(from: '1111234522226789', to: '1212343433335665', amount: '10.00')
  end

  describe '.success' do
    it 'has success? true' do
      result = described_class.success(instruction)

      expect(result).to be_success
      expect(result).not_to be_failure
    end

    it 'references original instruction' do
      result = described_class.success(instruction)

      expect(result.instruction).to eq(instruction)
    end
  end

  describe '.failure' do
    it 'has failure? true' do
      result = described_class.failure(instruction, reason_code: :insufficient_funds)

      expect(result).to be_failure
      expect(result).not_to be_success
    end

    it 'includes reason and reason_code' do
      result = described_class.failure(instruction, reason_code: :insufficient_funds)

      expect(result.reason).to eq('Insufficient funds')
      expect(result.reason_code).to eq(:insufficient_funds)
    end
  end
end
