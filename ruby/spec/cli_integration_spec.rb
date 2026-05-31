# frozen_string_literal: true

require 'open3'

RSpec.describe 'CLI subprocess integration' do
  let(:project_root) { File.expand_path('..', __dir__) }
  let(:balances_path) { File.expand_path('fixtures/mable_account_balances.csv', __dir__) }
  let(:transactions_path) { File.expand_path('fixtures/mable_transactions.csv', __dir__) }

  it 'runs bin/mable_bank against fixtures' do
    stdout, stderr, status = Open3.capture3(
      'ruby', 'bin/mable_bank', balances_path, transactions_path,
      chdir: project_root
    )

    expect(status.success?).to be(true), "stderr: #{stderr}\nstdout: #{stdout}"
    expect(stdout).to include('1111234522226789: 4820.50')
    expect(stdout).to include('Successful transfers: 4')
  end
end
