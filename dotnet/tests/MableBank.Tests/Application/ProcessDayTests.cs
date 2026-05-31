using FluentAssertions;
using MableBank.Application;
using MableBank.Infrastructure;

namespace MableBank.Tests.Application;

public sealed class ProcessDayTests
{
    private static string FixturePath(string fileName) =>
        Path.Combine(AppContext.BaseDirectory, "Fixtures", fileName);

    [Fact]
    public async Task Returns_processing_report_with_final_balances()
    {
        var report = await new ProcessDay(
            new CsvAccountBalanceReader(FixturePath("mable_account_balances.csv")),
            new CsvTransferInstructionReader(FixturePath("mable_transactions.csv"))).CallAsync();

        report.SucceededCount.Should().Be(4);
        report.FinalBalances.Should().HaveCount(5);
    }

    [Fact]
    public async Task Matches_provided_example_balances()
    {
        var report = await new ProcessDay(
            new CsvAccountBalanceReader(FixturePath("mable_account_balances.csv")),
            new CsvTransferInstructionReader(FixturePath("mable_transactions.csv"))).CallAsync();

        var balances = report.FinalBalances.ToDictionary(
            snapshot => snapshot.AccountNumber.Value,
            snapshot => snapshot.Balance.ToString(),
            StringComparer.Ordinal);

        balances["1111234522226789"].Should().Be("4820.50");
        balances["3212343433335755"].Should().Be("48679.50");
    }

    [Fact]
    public async Task Dry_run_reports_success_without_changing_starting_balances()
    {
        var report = await new ProcessDay(
            new CsvAccountBalanceReader(FixturePath("mable_account_balances.csv")),
            new CsvTransferInstructionReader(FixturePath("mable_transactions.csv")),
            dryRun: true).CallAsync();

        report.DryRun.Should().BeTrue();
        report.SucceededCount.Should().Be(4);
        var starting = report.FinalBalances
            .Single(snapshot => snapshot.AccountNumber.Value == "1111234522226789");
        starting.Balance.ToString().Should().Be("5000.00");
    }
}
