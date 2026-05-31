# frozen_string_literal: true

RSpec.describe MableBank::CLI do
  let(:balances_path) { File.expand_path('fixtures/mable_account_balances.csv', __dir__) }
  let(:transactions_path) { File.expand_path('fixtures/mable_transactions.csv', __dir__) }

  it 'runs with valid fixture files' do
    output = capture_stdout do
      expect(described_class.run([balances_path, transactions_path])).to eq(0)
    end

    expect(output).to include('Mable Bank Transfer Processing')
    expect(output).to include('Successful transfers: 4')
    expect(output).to include('1111234522226789: 4820.50')
  end

  it 'supports dry run mode without mutating balances' do
    output = capture_stdout do
      expect(described_class.run(['--dry-run', balances_path, transactions_path])).to eq(0)
    end

    expect(output).to include('dry run')
    expect(output).to include('1111234522226789: 5000.00')
    expect(output).to include('No balances were mutated during dry run.')
  end

  it 'returns non-zero for invalid usage' do
    expect(described_class.run([])).to eq(1)
  end

  it 'returns non-zero for unreadable files' do
    expect(described_class.run(['missing.csv', transactions_path])).to eq(1)
  end

  it 'returns non-zero for duplicate account numbers in balances file' do
    Tempfile.create(['balances', '.csv']) do |file|
      file.write(<<~CSV)
        Account,Balance
        1111234522226789,100.00
        1111234522226789,200.00
      CSV
      file.flush

      expect(described_class.run([file.path, transactions_path])).to eq(1)
    end
  end

  def capture_stdout
    original_stdout = $stdout
    $stdout = StringIO.new
    yield
    $stdout.string
  ensure
    $stdout = original_stdout
  end
end
