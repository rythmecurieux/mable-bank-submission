# frozen_string_literal: true

RSpec.describe MableBank::Domain::TransferId do
  describe '.derive' do
    it 'is stable for the same from, to, and amount' do
      from = MableBank::Domain::AccountNumber.new('1111234522226789')
      to = MableBank::Domain::AccountNumber.new('1212343433335665')
      amount = MableBank::Domain::Money.new('10.00')

      first = described_class.derive(from_account_number: from, to_account_number: to, amount: amount)
      second = described_class.derive(from_account_number: from, to_account_number: to, amount: amount)

      expect(first).to eq(second)
    end
  end

  describe '.parse' do
    it 'rejects blank values' do
      expect { described_class.parse('  ') }.to raise_error(MableBank::Domain::InvalidTransferInstructionError)
    end
  end
end
