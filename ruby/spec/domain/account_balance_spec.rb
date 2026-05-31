# frozen_string_literal: true

RSpec.describe MableBank::Domain::AccountBalance do
  it 'exposes account number and balance as read-only snapshot' do
    account_number = MableBank::Domain::AccountNumber.new('1111234522226789')
    balance = MableBank::Domain::Money.new('42.00')

    snapshot = described_class.new(account_number: account_number, balance: balance)

    expect(snapshot.account_number).to eq(account_number)
    expect(snapshot.balance).to eq(balance)
  end
end
