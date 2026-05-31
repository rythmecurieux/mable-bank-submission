# frozen_string_literal: true

module MableBank
  module Application
    module TransferOutcome
      module_function

      def wire_name(result)
        return 'succeeded' if result.success?
        return 'skipped' if result.skipped?

        'failed'
      end
    end
  end
end
