# frozen_string_literal: true

RSpec.describe MableBank::Infrastructure::CsvAccountBalanceReader do
  let(:fixture_path) { File.expand_path('../fixtures/mable_account_balances.csv', __dir__) }

  it 'reads valid account balances' do
    accounts = described_class.new(fixture_path).read

    expect(accounts.size).to eq(5)
    expect(accounts.first.account_number.to_s).to eq('1111234522226789')
    expect(accounts.first.balance.to_s).to eq('5000.00')
  end

  it 'handles headers' do
    Tempfile.create(['balances', '.csv']) do |file|
      file.write("Account,Balance\n1111234522226789,10.00\n")
      file.flush

      accounts = described_class.new(file.path).read

      expect(accounts.size).to eq(1)
    end
  end

  it 'rejects malformed rows' do
    Tempfile.create(['balances', '.csv']) do |file|
      file.write("Account,Balance\n1111234522226789\n")
      file.flush

      expect { described_class.new(file.path).read }
        .to raise_error(described_class::ParseError, /Row 2: missing Account or Balance/)
    end
  end

  it 'rejects invalid account numbers' do
    Tempfile.create(['balances', '.csv']) do |file|
      file.write("Account,Balance\n123,10.00\n")
      file.flush

      expect { described_class.new(file.path).read }
        .to raise_error(described_class::ParseError, /Row 2: Account number must be exactly 16 digits/)
    end
  end

  it 'rejects invalid balances' do
    Tempfile.create(['balances', '.csv']) do |file|
      file.write("Account,Balance\n1111234522226789,abc\n")
      file.flush

      expect { described_class.new(file.path).read }
        .to raise_error(described_class::ParseError, /Row 2:/)
    end
  end

  it 'reports missing files clearly' do
    expect { described_class.new('missing.csv').read }
      .to raise_error(described_class::ParseError, /not found/)
  end
end
