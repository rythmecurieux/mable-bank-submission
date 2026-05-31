# frozen_string_literal: true

module MableBank
  module Domain
    class NullLedger
      include Ledger

      def atomic
        yield
      end
    end
  end
end
