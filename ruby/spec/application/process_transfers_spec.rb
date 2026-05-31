# frozen_string_literal: true

RSpec.describe MableBank::Application::ProcessTransfers do
  let(:account_book) { example_account_book }
  let(:instructions) { example_transfer_instructions }
  let(:processor) { described_class.new(account_book: account_book) }

  it 'processes multiple transfers in order' do
    results = processor.call(instructions)

    expect(results.size).to eq(4)
    expect(results).to all(be_success)
  end

  it 'matches final balances for the provided example' do
    processor.call(instructions)

    balances = account_book.final_balances.to_h do |snapshot|
      [snapshot.account_number.to_s, snapshot.balance.to_s]
    end

    expect(balances).to eq(
      '1111234522221234' => '9974.40',
      '1111234522226789' => '4820.50',
      '1212343433335665' => '1725.60',
      '2222123433331212' => '1550.00',
      '3212343433335755' => '48679.50'
    )
  end

  it 'continues processing after a failed transfer' do
    failing_instruction = build_instruction(
      from: '1111234522226789',
      to: '1212343433335665',
      amount: '999999.00'
    )

    results = processor.call([failing_instruction] + instructions)

    expect(results.first).to be_failure
    expect(results[1..]).to all(be_success)
  end

  context 'when dry run is enabled' do
    let(:processor) { described_class.new(account_book: account_book, dry_run: true) }

    it 'evaluates transfers without mutating balances' do
      starting_balance = balance_amount(account_book, '1111234522226789')

      results = processor.call(instructions)

      expect(results).to all(be_success)
      expect(balance_amount(account_book, '1111234522226789')).to eq(starting_balance)
    end
  end
end
