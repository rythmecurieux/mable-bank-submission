# frozen_string_literal: true

module MableBank
  module Application
    class NullMetrics
      def increment(_name, **_tags)
        nil
      end
    end
  end
end
