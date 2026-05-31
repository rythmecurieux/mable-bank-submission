# frozen_string_literal: true

module DomainHelpers
  def build_account(number, balance)
    MableBank::Domain::Account.new(
      account_number: MableBank::Domain::AccountNumber.new(number),
      balance: MableBank::Domain::Money.new(balance)
    )
  end

  def build_instruction(from:, to:, amount:)
    MableBank::Domain::TransferInstruction.new(
      from_account_number: MableBank::Domain::AccountNumber.new(from),
      to_account_number: MableBank::Domain::AccountNumber.new(to),
      amount: MableBank::Domain::Money.new(amount)
    )
  end

  def example_account_book
    MableBank::Domain::CompanyAccountBook.new(
      [
        build_account('1111234522226789', '5000.00'),
        build_account('1111234522221234', '10000.00'),
        build_account('2222123433331212', '550.00'),
        build_account('1212343433335665', '1200.00'),
        build_account('3212343433335755', '50000.00')
      ]
    )
  end

  def example_transfer_instructions
    [
      build_instruction(from: '1111234522226789', to: '1212343433335665', amount: '500.00'),
      build_instruction(from: '3212343433335755', to: '2222123433331212', amount: '1000.00'),
      build_instruction(from: '3212343433335755', to: '1111234522226789', amount: '320.50'),
      build_instruction(from: '1111234522221234', to: '1212343433335665', amount: '25.60')
    ]
  end

  def balance_amount(account_book, account_number)
    snapshot = account_book.balance_for(MableBank::Domain::AccountNumber.new(account_number))
    MableBank::Infrastructure::MoneyFormatter.format(snapshot.balance)
  end
end

RSpec.configure do |config|
  config.include DomainHelpers
end
