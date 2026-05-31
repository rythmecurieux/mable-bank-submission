# frozen_string_literal: true

RSpec.describe 'Idempotency and transfer journal' do
  let(:balances_path) { File.expand_path('../fixtures/mable_account_balances.csv', __dir__) }
  let(:transactions_path) { File.expand_path('../fixtures/mable_transactions_duplicate.csv', __dir__) }

  it 'skips duplicate transfer id on second row without double debit' do
    report = MableBank::Application::ProcessDay.new(
      balances_reader: MableBank::Infrastructure::CsvAccountBalanceReader.new(balances_path),
      transfers_reader: MableBank::Infrastructure::CsvTransferInstructionReader.new(transactions_path)
    ).call

    expect(report.succeeded_count).to eq(4)
    expect(report.skipped_count).to eq(1)
    expect(report.journal_entries.size).to eq(5)
    expect(report.journal_entries.count { |e| e.outcome == 'skipped' }).to eq(1)

    balance = report.final_balances.find { |b| b.account_number.to_s == '1111234522226789' }
    expect(balance.balance.to_s).to eq('4820.50')
  end
end
