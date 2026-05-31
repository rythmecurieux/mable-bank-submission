# frozen_string_literal: true

module MableBank
  module Domain
    # Atomic transfer boundary (parity with .NET ILedger).
    module Ledger
      def atomic
        raise NotImplementedError, "#{self.class} must implement #atomic"
      end
    end
  end
end
