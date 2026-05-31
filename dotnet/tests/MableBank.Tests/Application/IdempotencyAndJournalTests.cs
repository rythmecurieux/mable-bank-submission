using FluentAssertions;
using MableBank.Application;
using MableBank.Infrastructure;

namespace MableBank.Tests.Application;

public sealed class IdempotencyAndJournalTests
{
    private static string FixturePath(string fileName) =>
        Path.Combine(AppContext.BaseDirectory, "Fixtures", fileName);

    [Fact]
    public async Task Skips_duplicate_transfer_without_double_debit_and_records_journal()
    {
        var report = await new ProcessDay(
            new CsvAccountBalanceReader(FixturePath("mable_account_balances.csv")),
            new CsvTransferInstructionReader(FixturePath("mable_transactions_duplicate.csv"))).CallAsync();

        report.SucceededCount.Should().Be(4);
        report.SkippedCount.Should().Be(1);
        report.JournalEntries.Should().HaveCount(5);
        report.JournalEntries.Count(entry => entry.Outcome == "skipped").Should().Be(1);

        var balance = report.FinalBalances.Single(snapshot =>
            snapshot.AccountNumber.Value == "1111234522226789");
        balance.Balance.ToString().Should().Be("4820.50");
    }
}
