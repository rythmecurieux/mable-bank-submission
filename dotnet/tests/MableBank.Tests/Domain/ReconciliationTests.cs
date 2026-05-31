using FluentAssertions;
using MableBank.Domain;
using MableBank.Domain.Errors;

namespace MableBank.Tests.Domain;

public sealed class ReconciliationTests
{
    [Fact]
    public void Passes_when_all_balances_are_non_negative()
    {
        var book = new CompanyAccountBook([
            new Account(AccountNumber.Parse("1111234522226789"), Money.Parse("100.00")),
        ]);

        Action act = () => Reconciliation.Verify(book);

        act.Should().NotThrow();
    }

    [Fact]
    public void Raises_when_any_balance_is_negative()
    {
        var balances = new[]
        {
            new AccountBalance(
                AccountNumber.Parse("1111234522226789"),
                Money.FromRawAmount(-1m)),
        };

        Action act = () => Reconciliation.VerifyBalances(balances);

        act.Should().Throw<ReconciliationException>().WithMessage("*Negative balance*");
    }
}
