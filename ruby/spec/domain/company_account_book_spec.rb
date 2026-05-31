# frozen_string_literal: true

RSpec.describe MableBank::Domain::CompanyAccountBook do
  subject(:account_book) do
    described_class.new(
      [
        build_account('1111234522226789', '500.00'),
        build_account('1212343433335665', '100.00'),
        build_account('2222123433331212', '50.00')
      ]
    )
  end

  it 'exposes read-only balance snapshots' do
    snapshot = account_book.balance_for(MableBank::Domain::AccountNumber.new('1111234522226789'))

    expect(snapshot).to be_a(MableBank::Domain::AccountBalance)
    expect(snapshot.balance.to_s).to eq('500.00')
  end

  it 'returns nil for unknown accounts' do
    expect(account_book.balance_for(MableBank::Domain::AccountNumber.new('9999999999999999'))).to be_nil
  end

  it 'rejects duplicate account numbers' do
    duplicate = build_account('1111234522226789', '200.00')

    expect { described_class.new([build_account('1111234522226789', '500.00'), duplicate]) }
      .to raise_error(MableBank::Domain::DuplicateAccountError, /Duplicate account number/)
  end

  it 'does not reflect mutations made to source accounts after registration' do
    mutable_account = build_account('1111234522226789', '500.00')
    book = described_class.new([mutable_account])

    mutable_account.credit(MableBank::Domain::Money.new('999.00'))

    expect(balance_amount(book, '1111234522226789')).to eq('500.00')
  end

  describe '#transfer' do
    let(:instruction) do
      build_instruction(from: '1111234522226789', to: '1212343433335665', amount: '100.00')
    end

    it 'processes successful transfer' do
      expect(account_book.transfer(instruction)).to be_success
    end

    it 'debits source account' do
      account_book.transfer(instruction)

      expect(balance_amount(account_book, '1111234522226789')).to eq('400.00')
    end

    it 'credits destination account' do
      account_book.transfer(instruction)

      expect(balance_amount(account_book, '1212343433335665')).to eq('200.00')
    end

    it 'rejects insufficient funds' do
      result = account_book.transfer(
        build_instruction(from: '1111234522226789', to: '1212343433335665', amount: '500.01')
      )

      expect(result).to be_failure
      expect(result.reason_code).to eq(:insufficient_funds)
    end

    it 'handles missing source account' do
      result = account_book.transfer(
        build_instruction(from: '9999999999999991', to: '1212343433335665', amount: '10.00')
      )

      expect(result.reason_code).to eq(:source_not_found)
    end

    it 'handles missing destination account' do
      result = account_book.transfer(
        build_instruction(from: '1111234522226789', to: '9999999999999992', amount: '10.00')
      )

      expect(result.reason_code).to eq(:destination_not_found)
    end

    it 'leaves balances unchanged on failed transfer' do
      account_book.transfer(
        build_instruction(from: '1111234522226789', to: '1212343433335665', amount: '500.01')
      )

      expect(balance_amount(account_book, '1111234522226789')).to eq('500.00')
      expect(balance_amount(account_book, '1212343433335665')).to eq('100.00')
    end

    it 'simulates transfers without mutating balances' do
      result = account_book.simulate(
        build_instruction(from: '1111234522226789', to: '1212343433335665', amount: '100.00')
      )

      expect(result).to be_success
      expect(balance_amount(account_book, '1111234522226789')).to eq('500.00')
      expect(balance_amount(account_book, '1212343433335665')).to eq('100.00')
    end
  end

  describe '#final_balances' do
    it 'returns deterministic final balances sorted by account number' do
      account_book.transfer(
        build_instruction(from: '1111234522226789', to: '1212343433335665', amount: '25.00')
      )

      balances = account_book.final_balances

      expect(balances.map { |snapshot| snapshot.account_number.to_s }).to eq(
        %w[1111234522226789 1212343433335665 2222123433331212]
      )
      expect(balances.map { |snapshot| snapshot.balance.to_s }).to include('475.00', '125.00')
    end
  end
end
