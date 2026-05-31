# frozen_string_literal: true

RSpec.describe MableBank::Domain::TransferInstruction do
  let(:from_account_number) { MableBank::Domain::AccountNumber.new('1111234522226789') }
  let(:to_account_number) { MableBank::Domain::AccountNumber.new('1212343433335665') }
  let(:amount) { MableBank::Domain::Money.new('50.00') }

  subject(:instruction) do
    described_class.new(
      from_account_number: from_account_number,
      to_account_number: to_account_number,
      amount: amount
    )
  end

  it 'stores source, destination and amount' do
    expect(instruction.from_account_number).to eq(from_account_number)
    expect(instruction.to_account_number).to eq(to_account_number)
    expect(instruction.amount).to eq(amount)
  end

  it 'validates account numbers are present' do
    expect do
      described_class.new(from_account_number: nil, to_account_number: to_account_number, amount: amount)
    end.to raise_error(MableBank::Domain::InvalidTransferInstructionError, /Source account/)
  end

  it 'validates amount is present' do
    expect do
      described_class.new(from_account_number: from_account_number, to_account_number: to_account_number, amount: nil)
    end.to raise_error(MableBank::Domain::InvalidTransferInstructionError, /amount/)
  end

  it 'rejects zero transfer amounts' do
    expect do
      described_class.new(
        from_account_number: from_account_number,
        to_account_number: to_account_number,
        amount: MableBank::Domain::Money.new('0.00')
      )
    end.to raise_error(MableBank::Domain::InvalidTransferInstructionError, /must be positive/)
  end

  it 'rejects transfers to the same account' do
    expect do
      described_class.new(
        from_account_number: from_account_number,
        to_account_number: from_account_number,
        amount: amount
      )
    end.to raise_error(MableBank::Domain::InvalidTransferInstructionError, /must differ/)
  end
end
