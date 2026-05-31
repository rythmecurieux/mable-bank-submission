# frozen_string_literal: true

module MableBank
  module Domain
    class CompanyAccountBook
      attr_writer :ledger

      def initialize(accounts = [])
        @accounts = {}
        @ledger = nil

        accounts.each { |account| add_account(account) }
      end

      def add_account(account)
        register(account)
      end

      def balance_for(account_number)
        account = @accounts[account_number]
        return unless account

        snapshot_for(account)
      end

      def transfer(instruction)
        reason_code = evaluate(instruction)
        return failure(instruction, reason_code) if reason_code

        ledger.atomic { apply(instruction) }
        TransferResult.success(instruction)
      end

      def simulate(instruction)
        reason_code = evaluate(instruction)
        return failure(instruction, reason_code) if reason_code

        TransferResult.success(instruction)
      end

      def final_balances
        @accounts.keys.sort_by(&:value).map { |account_number| snapshot_for(@accounts[account_number]) }
      end

      def capture_balance_snapshot
        @accounts.transform_values(&:balance)
      end

      def restore_balance_snapshot(snapshot)
        snapshot.each do |account_number, balance|
          @accounts[account_number].replace_balance!(balance)
        end
      end

      private

      def ledger
        @ledger || NullLedger.new
      end

      def evaluate(instruction)
        source = @accounts[instruction.from_account_number]
        return :source_not_found unless source

        destination = @accounts[instruction.to_account_number]
        return :destination_not_found unless destination

        return :insufficient_funds unless source.can_debit?(instruction.amount)

        nil
      end

      def apply(instruction)
        source = @accounts[instruction.from_account_number]
        destination = @accounts[instruction.to_account_number]

        source.debit!(instruction.amount)
        destination.credit(instruction.amount)
      end

      def register(account)
        account_number = account.account_number

        raise DuplicateAccountError, "Duplicate account number: #{account_number}" if @accounts.key?(account_number)

        @accounts[account_number] = copy_account(account)
      end

      def copy_account(account)
        account.class.new(account_number: account.account_number, balance: account.balance)
      end

      def snapshot_for(account)
        AccountBalance.new(account_number: account.account_number, balance: account.balance)
      end

      def failure(instruction, reason_code)
        TransferResult.failure(instruction, reason_code: reason_code)
      end
    end
  end
end
