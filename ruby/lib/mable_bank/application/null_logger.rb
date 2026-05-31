# frozen_string_literal: true

module MableBank
  module Application
    class NullLogger
      def info(*_args, **_kwargs)
        nil
      end
    end
  end
end
