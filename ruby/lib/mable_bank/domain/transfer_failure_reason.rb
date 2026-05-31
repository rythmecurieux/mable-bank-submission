# frozen_string_literal: true

module MableBank
  module Domain
    # Typed failure reasons for transfers (parity with .NET TransferFailureReason enum).
    module TransferFailureReason
      SOURCE_NOT_FOUND = :source_not_found
      DESTINATION_NOT_FOUND = :destination_not_found
      INSUFFICIENT_FUNDS = :insufficient_funds

      ALL = [SOURCE_NOT_FOUND, DESTINATION_NOT_FOUND, INSUFFICIENT_FUNDS].freeze
    end
  end
end
