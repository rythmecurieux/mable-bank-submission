# frozen_string_literal: true

module MableBank
  module Domain
    class NullLedger
      def atomic
        yield
      end
    end
  end
end
