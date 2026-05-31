# frozen_string_literal: true

module MableBank
  module Infrastructure
    class MoneyFormatter
      def self.format(money)
        Kernel.format('%.2f', money.amount)
      end
    end
  end
end
