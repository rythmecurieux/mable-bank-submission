# frozen_string_literal: true

RSpec.describe MableBank::Infrastructure::InputFile do
  it 'returns expanded path for a readable file' do
    path = File.expand_path('../fixtures/mable_account_balances.csv', __dir__)

    expect(described_class.validate!(path)).to eq(path)
  end

  it 'rejects missing files' do
    expect { described_class.validate!('missing.csv') }
      .to raise_error(described_class::ValidationError, /not found/)
  end

  it 'rejects empty path' do
    expect { described_class.validate!('   ') }
      .to raise_error(described_class::ValidationError, /required/)
  end
end
