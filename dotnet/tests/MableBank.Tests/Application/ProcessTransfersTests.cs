using FluentAssertions;
using MableBank.Application;
using MableBank.Domain;
using MableBank.Infrastructure;

namespace MableBank.Tests.Application;

public sealed class ProcessTransfersTests
{
    private static string FixturePath(string fileName) =>
        Path.Combine(AppContext.BaseDirectory, "Fixtures", fileName);

    private static CompanyAccountBook ExampleBook() =>
        new([
            new Account(AccountNumber.Parse("1111234522226789"), Money.Parse("5000.00")),
            new Account(AccountNumber.Parse("1111234522221234"), Money.Parse("10000.00")),
            new Account(AccountNumber.Parse("2222123433331212"), Money.Parse("550.00")),
            new Account(AccountNumber.Parse("1212343433335665"), Money.Parse("1200.00")),
            new Account(AccountNumber.Parse("3212343433335755"), Money.Parse("50000.00")),
        ]);

    [Fact]
    public async Task Matches_expected_final_balances_for_fixture_transfers()
    {
        var book = ExampleBook();
        var instructions = await new CsvTransferInstructionReader(FixturePath("mable_transactions.csv"))
            .ReadAllAsync();
        var processor = new ProcessTransfers(book);
        var results = processor.ProcessAll(instructions);

        results.Should().OnlyContain(result => result.IsSuccess);
        var balances = book.FinalBalances().ToDictionary(
            snapshot => snapshot.AccountNumber.Value,
            snapshot => snapshot.Balance.ToString(),
            StringComparer.Ordinal);

        balances.Should().BeEquivalentTo(new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["1111234522221234"] = "9974.40",
            ["1111234522226789"] = "4820.50",
            ["1212343433335665"] = "1725.60",
            ["2222123433331212"] = "1550.00",
            ["3212343433335755"] = "48679.50",
        });
    }

    [Fact]
    public async Task Continues_after_a_failed_transfer()
    {
        var book = ExampleBook();
        var failing = TransferInstruction.Create(
            AccountNumber.Parse("1111234522226789"),
            AccountNumber.Parse("1212343433335665"),
            Money.Parse("999999.00"));
        var instructions = await new CsvTransferInstructionReader(FixturePath("mable_transactions.csv"))
            .ReadAllAsync();
        var processor = new ProcessTransfers(book);
        var results = processor.ProcessAll([failing, ..instructions]);

        results[0].IsFailure.Should().BeTrue();
        results.Skip(1).Should().OnlyContain(result => result.IsSuccess);
    }

    [Fact]
    public async Task Dry_run_simulates_without_mutating_balances()
    {
        var book = ExampleBook();
        var instructions = await new CsvTransferInstructionReader(FixturePath("mable_transactions.csv"))
            .ReadAllAsync();
        new ProcessTransfers(book, dryRun: true).ProcessAll(instructions);

        book.BalanceFor(AccountNumber.Parse("1111234522226789"))!.Balance.ToString().Should().Be("5000.00");
    }
}
