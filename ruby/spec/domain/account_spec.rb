# frozen_string_literal: true

RSpec.describe MableBank::Domain::Account do
  let(:account_number) { MableBank::Domain::AccountNumber.new('1111234522226789') }
  let(:balance) { MableBank::Domain::Money.new('100.00') }

  subject(:account) { described_class.new(account_number: account_number, balance: balance) }

  it 'initializes with account number and balance' do
    expect(account.account_number).to eq(account_number)
    expect(account.balance.to_s).to eq('100.00')
  end

  it 'credits money' do
    account.credit(MableBank::Domain::Money.new('25.50'))

    expect(account.balance.to_s).to eq('125.50')
  end

  it 'debits money when funds are available' do
    account.debit!(MableBank::Domain::Money.new('40.00'))

    expect(account.balance.to_s).to eq('60.00')
  end

  it 'reports when a debit would exceed the balance' do
    expect(account.can_debit?(MableBank::Domain::Money.new('100.01'))).to be(false)
  end

  it 'raises when debit would exceed the balance' do
    expect { account.debit!(MableBank::Domain::Money.new('100.01')) }
      .to raise_error(MableBank::Domain::InsufficientFundsError)
  end

  it 'allows debits up to the available balance' do
    expect(account.can_debit?(MableBank::Domain::Money.new('100.00'))).to be(true)
  end
end
