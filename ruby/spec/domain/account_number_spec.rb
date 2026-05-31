# frozen_string_literal: true

RSpec.describe MableBank::Domain::AccountNumber do
  describe 'validation' do
    it 'accepts valid 16 digit value' do
      account_number = described_class.new('1111234522226789')

      expect(account_number.value).to eq('1111234522226789')
    end

    it 'preserves value as string' do
      account_number = described_class.new('0001234522226789')

      expect(account_number.to_s).to eq('0001234522226789')
    end

    it 'rejects nil' do
      expect { described_class.new(nil) }.to raise_error(MableBank::Domain::InvalidAccountNumberError, /nil/)
    end

    it 'rejects blank values' do
      expect { described_class.new('  ') }.to raise_error(MableBank::Domain::InvalidAccountNumberError, /blank/)
    end

    it 'rejects non-digit characters' do
      expect { described_class.new('111123452222678X') }
        .to raise_error(MableBank::Domain::InvalidAccountNumberError, /only digits/)
    end

    it 'rejects too-short values' do
      expect { described_class.new('123') }
        .to raise_error(MableBank::Domain::InvalidAccountNumberError, /exactly 16 digits/)
    end

    it 'rejects too-long values' do
      expect { described_class.new('1' * 17) }
        .to raise_error(MableBank::Domain::InvalidAccountNumberError, /exactly 16 digits/)
    end
  end

  describe 'equality' do
    it 'compares equal by value' do
      first = described_class.new('1111234522226789')
      second = described_class.new('1111234522226789')

      expect(first).to eq(second)
    end
  end
end
