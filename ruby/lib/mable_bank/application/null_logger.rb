# frozen_string_literal: true

module MableBank
  module Application
    module LoggerPort
      def log_transfer_processed(_telemetry)
        raise NotImplementedError, "#{self.class} must implement #log_transfer_processed"
      end
    end

    class NullLogger
      include LoggerPort

      def log_transfer_processed(_telemetry)
        nil
      end
    end
  end
end
