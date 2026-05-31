# frozen_string_literal: true

module MableBank
  module Application
    class RecordingMetrics
      attr_reader :increments

      def initialize
        @increments = []
      end

      def increment(name, **tags)
        @increments << { name: name, tags: tags }
      end
    end
  end
end
