# frozen_string_literal: true

module MableBank
  module Application
    class RecordingMetrics
      include MetricsPort

      attr_reader :records, :increments

      def initialize
        @records = []
        @increments = []
      end

      def record_transfer_processed(telemetry)
        @records << telemetry
        @increments << telemetry.to_metric_increment
      end
    end
  end
end
