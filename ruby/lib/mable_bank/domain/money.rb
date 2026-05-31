# frozen_string_literal: true

require 'bigdecimal'

module MableBank
  module Domain
    class Money
      include Comparable

      SCALE = 2

      attr_reader :amount

      def initialize(value)
        raise InvalidMoneyAmountError, 'Money amount cannot be nil' if value.nil?

        string_value = value.to_s.strip
        raise InvalidMoneyAmountError, 'Money amount cannot be blank' if string_value.empty?

        validate_scale!(string_value)
        @amount = parse_amount(string_value).round(SCALE)
        raise InvalidMoneyAmountError, 'Money amount cannot be negative' if @amount.negative?
      end

      def +(other)
        self.class.from_amount(amount + other.amount)
      end

      def -(other)
        self.class.from_amount(amount - other.amount)
      end

      def <=>(other)
        amount <=> other.amount
      end

      def to_s
        Kernel.format("%.#{SCALE}f", amount)
      end

      def ==(other)
        other.is_a?(self.class) && amount == other.amount
      end
      alias eql? ==

      def hash
        amount.hash
      end

      def self.from_amount(bigdecimal)
        new(bigdecimal.round(SCALE).to_s('F'))
      end

      private

      def validate_scale!(string_value)
        fractional = string_value.split('.', 2)[1]
        return unless fractional

        trimmed = fractional.delete_suffix('0')
        return if trimmed.length <= SCALE

        raise InvalidMoneyAmountError, "Money supports at most #{SCALE} decimal places"
      end

      def parse_amount(string_value)
        BigDecimal(string_value)
      rescue ArgumentError
        raise InvalidMoneyAmountError, "Invalid money amount: #{string_value.inspect}"
      end
    end
  end
end
