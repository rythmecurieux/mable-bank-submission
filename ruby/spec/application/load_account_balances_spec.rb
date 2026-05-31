# frozen_string_literal: true

RSpec.describe MableBank::Application::LoadAccountBalances do
  let(:reader) do
    Class.new do
      def read
        [
          MableBank::Domain::Account.new(
            account_number: MableBank::Domain::AccountNumber.new('1111234522226789'),
            balance: MableBank::Domain::Money.new('100.00')
          )
        ]
      end
    end.new
  end

  it 'loads account balances into CompanyAccountBook' do
    account_book = described_class.new(reader: reader).call

    snapshot = account_book.balance_for(MableBank::Domain::AccountNumber.new('1111234522226789'))

    expect(snapshot.balance.to_s).to eq('100.00')
  end

  it 'rejects duplicate accounts from the reader' do
    duplicate_reader = Class.new do
      include DomainHelpers

      def read
        [
          build_account('1111234522226789', '100.00'),
          build_account('1111234522226789', '200.00')
        ]
      end
    end.new

    expect { described_class.new(reader: duplicate_reader).call }
      .to raise_error(MableBank::Domain::DuplicateAccountError)
  end

  it 'registers accounts from each_account without calling read' do
    streaming_reader = Class.new do
      include DomainHelpers

      def each_account
        return enum_for(:each_account) unless block_given?

        yield build_account('1111234522226789', '250.00')
        yield build_account('1212343433335665', '75.00')
      end

      def read
        raise 'read should not be called when each_account is implemented'
      end
    end.new

    book = described_class.new(reader: streaming_reader).call

    expect(book.balance_for(MableBank::Domain::AccountNumber.new('1111234522226789')).balance.to_s).to eq('250.00')
    expect(book.balance_for(MableBank::Domain::AccountNumber.new('1212343433335665')).balance.to_s).to eq('75.00')
  end
end
