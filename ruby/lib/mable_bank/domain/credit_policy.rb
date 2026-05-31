# frozen_string_literal: true

module MableBank
  module Domain
    # Applies credits to an account balance (parity with .NET ICreditPolicy).
    module CreditPolicy
      def apply_credit(current_balance, amount)
        raise NotImplementedError, "#{self.class} must implement #apply_credit"
      end
    end

    class DefaultCreditPolicy
      include CreditPolicy

      def apply_credit(current_balance, amount)
        current_balance + amount
      end
    end
  end
end
