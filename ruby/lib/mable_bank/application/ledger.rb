# frozen_string_literal: true

module MableBank
  module Application
    # Port for atomic debit/credit. Default: Infrastructure::RollingBackLedger (sync, in-memory).
    module Ledger
      def atomic
        raise NotImplementedError, "#{self.class} must implement #atomic"
      end
    end
  end
end
