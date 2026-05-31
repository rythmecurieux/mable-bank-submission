# frozen_string_literal: true

RSpec.describe MableBank::Domain::Reconciliation do
  it 'passes when all balances are non-negative' do
    book = example_account_book

    expect { described_class.verify!(book) }.not_to raise_error
  end

  it 'raises when any balance is negative' do
    account_number = MableBank::Domain::AccountNumber.new('1111234522226789')
    negative_balance = instance_double(MableBank::Domain::Money, amount: BigDecimal('-1'))
    snapshot = instance_double(
      MableBank::Domain::AccountBalance,
      account_number: account_number,
      balance: negative_balance
    )
    book = instance_double(MableBank::Domain::CompanyAccountBook, final_balances: [snapshot])

    expect { described_class.verify!(book) }
      .to raise_error(MableBank::Domain::ReconciliationError, /Negative balance/)
  end
end
