# frozen_string_literal: true

module MableBank
  module Application
    module MetricsPort
      def record_transfer_processed(_telemetry)
        raise NotImplementedError, "#{self.class} must implement #record_transfer_processed"
      end
    end

    class NullMetrics
      include MetricsPort

      def record_transfer_processed(_telemetry)
        nil
      end
    end
  end
end
