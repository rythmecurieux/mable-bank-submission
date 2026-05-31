# frozen_string_literal: true

RSpec.describe MableBank::Application::ProcessDay do
  let(:balances_path) { File.expand_path('../fixtures/mable_account_balances.csv', __dir__) }
  let(:transactions_path) { File.expand_path('../fixtures/mable_transactions.csv', __dir__) }

  subject(:report) do
    described_class.new(
      balances_reader: MableBank::Infrastructure::CsvAccountBalanceReader.new(balances_path),
      transfers_reader: MableBank::Infrastructure::CsvTransferInstructionReader.new(transactions_path)
    ).call
  end

  it 'returns a processing report with final balances' do
    expect(report).to be_a(MableBank::Application::ProcessingReport)
    expect(report.succeeded_count).to eq(4)
    expect(report.final_balances.size).to eq(5)
  end

  it 'matches the provided example balances' do
    balances = report.final_balances.to_h { |snapshot| [snapshot.account_number.to_s, snapshot.balance.to_s] }

    expect(balances['1111234522226789']).to eq('4820.50')
    expect(balances['3212343433335755']).to eq('48679.50')
  end

  context 'with dry run enabled' do
    subject(:report) do
      described_class.new(
        balances_reader: MableBank::Infrastructure::CsvAccountBalanceReader.new(balances_path),
        transfers_reader: MableBank::Infrastructure::CsvTransferInstructionReader.new(transactions_path),
        dry_run: true
      ).call
    end

    it 'reports success without changing starting balances' do
      expect(report.dry_run?).to be(true)
      expect(report.succeeded_count).to eq(4)
      starting = report.final_balances.find { |snapshot| snapshot.account_number.to_s == '1111234522226789' }

      expect(starting.balance.to_s).to eq('5000.00')
    end
  end
end
