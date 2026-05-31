# frozen_string_literal: true

RSpec.describe MableBank::Infrastructure::CsvTransferInstructionReader do
  let(:fixture_path) { File.expand_path('../fixtures/mable_transactions.csv', __dir__) }

  it 'reads valid transfer instructions' do
    instructions = described_class.new(fixture_path).read

    expect(instructions.size).to eq(4)
    expect(instructions.first.from_account_number.to_s).to eq('1111234522226789')
    expect(instructions.first.to_account_number.to_s).to eq('1212343433335665')
    expect(instructions.first.amount.to_s).to eq('500.00')
  end

  it 'handles headers' do
    Tempfile.create(['transactions', '.csv']) do |file|
      file.write("From,To,Amount\n1111234522226789,1212343433335665,10.00\n")
      file.flush

      instructions = described_class.new(file.path).read

      expect(instructions.size).to eq(1)
    end
  end

  it 'rejects malformed rows' do
    Tempfile.create(['transactions', '.csv']) do |file|
      file.write("From,To,Amount\n1111234522226789,1212343433335665\n")
      file.flush

      expect { described_class.new(file.path).read }
        .to raise_error(described_class::ParseError, /Row 2: missing From, To, or Amount/)
    end
  end

  it 'rejects invalid source account numbers' do
    Tempfile.create(['transactions', '.csv']) do |file|
      file.write("From,To,Amount\n123,1212343433335665,10.00\n")
      file.flush

      expect { described_class.new(file.path).read }
        .to raise_error(described_class::ParseError, /Row 2: Account number must be exactly 16 digits/)
    end
  end

  it 'rejects invalid destination account numbers' do
    Tempfile.create(['transactions', '.csv']) do |file|
      file.write("From,To,Amount\n1111234522226789,123,10.00\n")
      file.flush

      expect { described_class.new(file.path).read }
        .to raise_error(described_class::ParseError, /Row 2: Account number must be exactly 16 digits/)
    end
  end

  it 'rejects invalid transfer amounts' do
    Tempfile.create(['transactions', '.csv']) do |file|
      file.write("From,To,Amount\n1111234522226789,1212343433335665,abc\n")
      file.flush

      expect { described_class.new(file.path).read }
        .to raise_error(described_class::ParseError, /Row 2:/)
    end
  end

  it 'streams instructions without loading the entire file upfront' do
    instructions = []
    described_class.new(fixture_path).each_instruction { |instruction| instructions << instruction }

    expect(instructions.size).to eq(4)
  end

  it 'reports missing files clearly' do
    expect { described_class.new('missing.csv').read }
      .to raise_error(described_class::ParseError, /not found/)
  end
end
