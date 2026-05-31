# frozen_string_literal: true

RSpec.describe MableBank::Infrastructure::MoneyFormatter do
  it 'formats money to two decimal places for presentation' do
    money = MableBank::Domain::Money.new('5.5')

    expect(described_class.format(money)).to eq('5.50')
  end
end
