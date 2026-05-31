# frozen_string_literal: true

RSpec.describe MableBank::Domain::CompanyAccountBook do
  def build_book_from_hashes(balances)
    accounts = balances.map do |number, amount|
      build_account(number, amount)
    end
    described_class.new(accounts)
  end

  def snapshot_balances(book)
    book.final_balances.to_h { |s| [s.account_number.to_s, s.balance.amount] }
  end

  def assert_random_transfer_invariants
    accounts = {
      '1111234522226789' => '500.00',
      '1212343433335665' => '200.00',
      '2222123433331212' => '100.00'
    }
    book = build_book_from_hashes(accounts)
    before = snapshot_balances(book)
    from, to = accounts.keys.sample(2)
    return if from == to

    amount = %w[1.00 5.00 10.00 25.00 50.00].sample
    result = book.transfer(build_instruction(from: from, to: to, amount: amount))
    after = snapshot_balances(book)

    after.each_value { |value| expect(value).to be >= 0 }
    return unless result.success?

    expect(after[from]).to eq(before[from] - BigDecimal(amount))
    expect(after[to]).to eq(before[to] + BigDecimal(amount))
  end

  it 'never leaves balances negative after successful transfers' do
    20.times { assert_random_transfer_invariants }
  end

  it 'leaves balances unchanged when transfer fails for insufficient funds' do
    book = build_book_from_hashes('1111234522226789' => '10.00', '1212343433335665' => '0.00')
    before = snapshot_balances(book)

    result = book.transfer(
      build_instruction(from: '1111234522226789', to: '1212343433335665', amount: '500.00')
    )

    expect(result).to be_failure
    expect(snapshot_balances(book)).to eq(before)
  end
end
