# frozen_string_literal: true

module MableBank
  module Domain
    class AccountNumber
      DIGIT_LENGTH = 16
      DIGIT_PATTERN = /\A\d{16}\z/

      attr_reader :value

      def initialize(value)
        raise InvalidAccountNumberError, 'Account number cannot be nil' if value.nil?

        @value = value.to_s.strip
        raise InvalidAccountNumberError, 'Account number cannot be blank' if @value.empty?
        raise InvalidAccountNumberError, 'Account number must contain only digits' unless @value.match?(/\A\d+\z/)
        raise InvalidAccountNumberError, "Account number must be exactly #{DIGIT_LENGTH} digits" unless valid_length?
      end

      def ==(other)
        other.is_a?(self.class) && value == other.value
      end
      alias eql? ==

      def hash
        value.hash
      end

      def to_s
        value
      end

      private

      def valid_length?
        @value.match?(DIGIT_PATTERN)
      end
    end
  end
end
