# frozen_string_literal: true

RSpec.describe MableBank::Infrastructure::ConsoleReporter do
  let(:instruction) do
    build_instruction(from: '1111234522226789', to: '1212343433335665', amount: '999999.00')
  end

  def build_report(dry_run: false)
    recorder = MableBank::Application::TransferResultRecorder.new
    recorder.record(MableBank::Domain::TransferResult.success(instruction))
    recorder.record(MableBank::Domain::TransferResult.failure(instruction, reason_code: :insufficient_funds))

    MableBank::Application::ProcessingReport.new(
      recorder: recorder,
      account_book: example_account_book,
      dry_run: dry_run
    )
  end

  it 'prints summary, final balances, and failed transfers' do
    output = described_class.new.report(build_report)

    expect(output).to include('Mable Bank Transfer Processing')
    expect(output).to include('Transfers processed: 2')
    expect(output).to include('Successful transfers: 1')
    expect(output).to include('Failed transfers: 1')
    expect(output).to include('Failed transfers:')
    expect(output).to include('Insufficient funds')
  end

  it 'labels dry run output clearly' do
    recorder = MableBank::Application::TransferResultRecorder.new
    recorder.record(MableBank::Domain::TransferResult.success(instruction))

    report = MableBank::Application::ProcessingReport.new(
      recorder: recorder,
      account_book: example_account_book,
      dry_run: true
    )

    output = described_class.new.report(report)

    expect(output).to include('dry run')
    expect(output).to include('No balances were mutated during dry run.')
  end
end
