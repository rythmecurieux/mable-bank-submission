# frozen_string_literal: true

module MableBank
  module Application
    TransferJournalEntry = Data.define(
      :run_id,
      :transfer_id,
      :outcome,
      :reason_code,
      :instruction,
      :recorded_at
    )

    class TransferJournal
      def record(_entry)
        raise NotImplementedError
      end

      def entries
        raise NotImplementedError
      end
    end

    class InMemoryTransferJournal < TransferJournal
      attr_reader :entries

      def initialize
        super
        @entries = []
      end

      def record(entry)
        @entries << entry
      end
    end
  end
end
