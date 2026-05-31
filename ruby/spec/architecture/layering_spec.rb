# frozen_string_literal: true

RSpec.describe 'Architecture layering' do
  let(:lib_root) { File.expand_path('../../lib/mable_bank', __dir__) }

  def ruby_files_under(segment)
    Dir.glob(File.join(lib_root, segment, '**', '*.rb'))
  end

  def file_requires_application_or_infrastructure?(path)
    contents = File.read(path)
    contents.match?(%r{mable_bank/(application|infrastructure)})
  end

  it 'domain files do not require application or infrastructure' do
    violations = ruby_files_under('domain').select { |path| file_requires_application_or_infrastructure?(path) }
    expect(violations).to be_empty, "violations: #{violations.join(', ')}"
  end

  it 'application files do not require infrastructure' do
    violations = ruby_files_under('application').select do |path|
      File.read(path).match?(%r{mable_bank/infrastructure})
    end
    expect(violations).to be_empty, "violations: #{violations.join(', ')}"
  end

  it 'domain errors inherit from DomainError and MableBank::Error' do
    expect(MableBank::Domain::DomainError).to be < MableBank::Error
    expect(MableBank::Domain::InvalidAccountNumberError).to be < MableBank::Domain::DomainError
    expect(MableBank::Domain::InvariantViolationError).to be < MableBank::Domain::DomainError
  end
end
