# frozen_string_literal: true

RSpec.shared_context 'with fixture csv paths' do
  let(:balances_path) { File.expand_path('../fixtures/mable_account_balances.csv', __dir__) }
  let(:transactions_path) { File.expand_path('../fixtures/mable_transactions.csv', __dir__) }
end
