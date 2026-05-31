# frozen_string_literal: true

module MableBank
  module Domain
    class FailingCreditPolicy
      include CreditPolicy

      def apply_credit(_current_balance, _amount)
        raise StandardError, 'credit failed'
      end
    end
  end
end

RSpec.describe MableBank::Application::RollingBackLedger do
  it 'restores balances when apply raises after debit' do
    source = build_account('1111234522226789', '100.00')
    destination = MableBank::Domain::Account.new(
      account_number: MableBank::Domain::AccountNumber.new('1212343433335665'),
      balance: MableBank::Domain::Money.new('50.00'),
      credit_policy: MableBank::Domain::FailingCreditPolicy.new
    )
    book = MableBank::Domain::CompanyAccountBook.new([source, destination])
    book.use_ledger(described_class.new(book))
    instruction = build_instruction(from: '1111234522226789', to: '1212343433335665', amount: '10.00')

    expect { book.transfer(instruction) }.to raise_error(StandardError, /credit failed/)
    expect(balance_amount(book, '1111234522226789')).to eq('100.00')
    expect(balance_amount(book, '1212343433335665')).to eq('50.00')
  end
end
