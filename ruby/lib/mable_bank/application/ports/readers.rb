# frozen_string_literal: true

module MableBank
  module Application
    module AccountBalanceReader
      def each_account
        raise NotImplementedError, "#{self.class} must implement #each_account"
      end
    end

    module TransferInstructionReader
      def each_instruction
        raise NotImplementedError, "#{self.class} must implement #each_instruction"
      end
    end
  end
end
