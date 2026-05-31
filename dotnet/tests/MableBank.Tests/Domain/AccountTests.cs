using FluentAssertions;
using MableBank.Domain;
using MableBank.Domain.Errors;

namespace MableBank.Tests.Domain;

public sealed class AccountTests
{
    [Fact]
    public void Credits_and_debits()
    {
        var account = new Account(AccountNumber.Parse("1111234522226789"), Money.Parse("100.00"));
        account.Credit(Money.Parse("25.00"));
        account.Debit(Money.Parse("10.00"));
        account.Balance.ToString().Should().Be("115.00");
    }

    [Fact]
    public void Rejects_overdraft_and_leaves_balance_unchanged()
    {
        var account = new Account(AccountNumber.Parse("1111234522226789"), Money.Parse("10.00"));
        account.CanDebit(Money.Parse("10.01")).Should().BeFalse();

        Action debit = () => account.Debit(Money.Parse("10.01"));
        debit.Should().Throw<InsufficientFundsException>();
        account.Balance.ToString().Should().Be("10.00");
    }

    [Fact]
    public void Allows_exact_balance_debit()
    {
        var account = new Account(AccountNumber.Parse("1111234522226789"), Money.Parse("10.00"));
        account.Debit(Money.Parse("10.00"));
        account.Balance.ToString().Should().Be("0.00");
    }
}
