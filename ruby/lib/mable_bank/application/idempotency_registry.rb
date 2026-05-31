# frozen_string_literal: true

module MableBank
  module Application
    class IdempotencyRegistry
      def seen?(_transfer_id)
        raise NotImplementedError
      end

      def register(_transfer_id)
        raise NotImplementedError
      end
    end

    class InMemoryIdempotencyRegistry < IdempotencyRegistry
      def initialize
        super
        @ids = {}
      end

      def seen?(transfer_id)
        @ids.key?(transfer_id.value)
      end

      def register(transfer_id)
        @ids[transfer_id.value] = true
      end
    end
  end
end
