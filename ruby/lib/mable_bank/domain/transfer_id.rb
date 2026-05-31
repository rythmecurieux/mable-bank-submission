# frozen_string_literal: true

require 'digest'

module MableBank
  module Domain
    class TransferId
      attr_reader :value

      def self.derive(from_account_number:, to_account_number:, amount:)
        key = [
          from_account_number.to_s,
          to_account_number.to_s,
          amount.to_s
        ].join('|')
        new(Digest::SHA256.hexdigest(key))
      end

      def self.parse(value)
        raise InvalidTransferInstructionError, 'Transfer id cannot be blank' if value.nil? || value.strip.empty?

        new(value.strip)
      end

      def initialize(value)
        @value = value
      end

      def ==(other)
        other.is_a?(self.class) && value == other.value
      end

      def eql?(other)
        self == other
      end

      def hash
        value.hash
      end

      def to_s
        value
      end
    end
  end
end
