# frozen_string_literal: true

module MableBank
  module Application
    class RecordingLogger
      include LoggerPort

      attr_reader :entries, :wire_entries

      def initialize
        @entries = []
        @wire_entries = []
      end

      def log_transfer_processed(telemetry)
        @entries << telemetry
        @wire_entries << telemetry.to_log_entry
      end
    end
  end
end
