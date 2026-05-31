# frozen_string_literal: true

module MableBank
  module Application
    class RecordingLogger
      attr_reader :entries

      def initialize
        @entries = []
      end

      def info(**payload)
        @entries << payload
      end
    end
  end
end
