using FluentAssertions;
using MableBank.Domain;
using MableBank.Domain.Errors;

namespace MableBank.Tests.Domain;

public sealed class CompanyAccountBookTests
{
    private static CompanyAccountBook ExampleBook() =>
        new([
            new Account(AccountNumber.Parse("1111234522226789"), Money.Parse("500.00")),
            new Account(AccountNumber.Parse("1212343433335665"), Money.Parse("100.00")),
            new Account(AccountNumber.Parse("2222123433331212"), Money.Parse("50.00")),
        ]);

    private static TransferInstruction Instruction(string from, string to, string amount) =>
        TransferInstruction.Create(
            AccountNumber.Parse(from),
            AccountNumber.Parse(to),
            Money.Parse(amount));

    [Fact]
    public void Processes_successful_transfer()
    {
        var book = ExampleBook();
        var result = book.Transfer(Instruction("1111234522226789", "1212343433335665", "100.00"));
        result.IsSuccess.Should().BeTrue();
        book.BalanceFor(AccountNumber.Parse("1111234522226789"))!.Balance.ToString().Should().Be("400.00");
        book.BalanceFor(AccountNumber.Parse("1212343433335665"))!.Balance.ToString().Should().Be("200.00");
    }

    [Fact]
    public void Rejects_insufficient_funds_without_mutation()
    {
        var book = ExampleBook();
        var before = Snapshot(book);
        var result = book.Transfer(Instruction("1111234522226789", "1212343433335665", "500.01"));
        result.Should().BeOfType<TransferFailureResult>();
        Snapshot(book).Should().BeEquivalentTo(before);
    }

    [Fact]
    public void Handles_missing_accounts()
    {
        var book = ExampleBook();
        var missingSource = book.Transfer(Instruction("9999999999999991", "1212343433335665", "10.00"));
        missingSource.IsFailure.Should().BeTrue();
        ((TransferFailureResult)missingSource).Reason.Should().Be(TransferFailureReason.SourceNotFound);

        var missingDestination = book.Transfer(Instruction("1111234522226789", "9999999999999992", "10.00"));
        missingDestination.IsFailure.Should().BeTrue();
        ((TransferFailureResult)missingDestination).Reason.Should().Be(TransferFailureReason.DestinationNotFound);
    }

    [Fact]
    public void Rejects_duplicate_accounts()
    {
        Action add = () =>
        {
            var book = new CompanyAccountBook();
            book.AddAccount(new Account(AccountNumber.Parse("1111234522226789"), Money.Parse("1.00")));
            book.AddAccount(new Account(AccountNumber.Parse("1111234522226789"), Money.Parse("2.00")));
        };
        add.Should().Throw<DuplicateAccountException>();
    }

    [Fact]
    public void Simulate_evaluates_without_mutating_balances()
    {
        var book = ExampleBook();
        var before = Snapshot(book);
        var result = book.Simulate(Instruction("1111234522226789", "1212343433335665", "100.00"));
        result.IsSuccess.Should().BeTrue();
        Snapshot(book).Should().BeEquivalentTo(before);
    }

    [Fact]
    public void Returns_sorted_final_balances()
    {
        var book = ExampleBook();
        book.Transfer(Instruction("1111234522226789", "1212343433335665", "25.00"));
        var numbers = book.FinalBalances().Select(snapshot => snapshot.AccountNumber.Value).ToList();
        numbers.Should().Equal("1111234522226789", "1212343433335665", "2222123433331212");
    }

    private static Dictionary<string, string> Snapshot(CompanyAccountBook book) =>
        book.FinalBalances().ToDictionary(
            snapshot => snapshot.AccountNumber.Value,
            snapshot => snapshot.Balance.ToString(),
            StringComparer.Ordinal);
}
