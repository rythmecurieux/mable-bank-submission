# frozen_string_literal: true

RSpec.describe MableBank::Domain::Money do
  describe 'construction' do
    it 'creates from string' do
      money = described_class.new('10.50')

      expect(money.to_s).to eq('10.50')
    end

    it 'creates from integer' do
      money = described_class.new(25)

      expect(money.to_s).to eq('25.00')
    end

    it 'creates from decimal-like input safely' do
      money = described_class.new(BigDecimal('0.1') + BigDecimal('0.2'))

      expect(money.to_s).to eq('0.30')
    end

    it 'rejects more than two decimal places in input' do
      expect { described_class.new('10.001') }
        .to raise_error(MableBank::Domain::InvalidMoneyAmountError, /at most 2 decimal places/)
    end

    it 'rejects nil' do
      expect { described_class.new(nil) }.to raise_error(MableBank::Domain::InvalidMoneyAmountError, /nil/)
    end

    it 'rejects blank values' do
      expect { described_class.new('   ') }.to raise_error(MableBank::Domain::InvalidMoneyAmountError, /blank/)
    end

    it 'rejects malformed values' do
      expect { described_class.new('abc') }
        .to raise_error(MableBank::Domain::InvalidMoneyAmountError, /Invalid money amount/)
    end

    it 'rejects negative values' do
      expect { described_class.new('-1.00') }.to raise_error(MableBank::Domain::InvalidMoneyAmountError, /negative/)
    end
  end

  describe 'arithmetic' do
    it 'adds accurately' do
      result = described_class.new('10.10') + described_class.new('0.05')

      expect(result.to_s).to eq('10.15')
    end

    it 'subtracts accurately' do
      result = described_class.new('10.00') - described_class.new('3.25')

      expect(result.to_s).to eq('6.75')
    end

    it 'compares accurately' do
      smaller = described_class.new('1.00')
      larger = described_class.new('2.00')

      expect(smaller).to be < larger
      expect(larger).to be > smaller
    end

    it 'avoids Float-style precision errors' do
      result = described_class.new('0.1') + described_class.new('0.2')

      expect(result.to_s).to eq('0.30')
    end

    it 'rounds arithmetic to two decimal places' do
      result = described_class.new('0.10') + described_class.new('0.10') + described_class.new('0.10')

      expect(result.to_s).to eq('0.30')
    end
  end

  describe '#to_s' do
    it 'formats to two decimal places' do
      expect(described_class.new('5').to_s).to eq('5.00')
      expect(described_class.new('5.5').to_s).to eq('5.50')
    end
  end
end
