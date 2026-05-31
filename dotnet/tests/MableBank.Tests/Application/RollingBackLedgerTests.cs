using FluentAssertions;
using MableBank.Application;
using MableBank.Domain;

namespace MableBank.Tests.Application;

public sealed class RollingBackLedgerTests
{
    private sealed class FailingCreditPolicy : ICreditPolicy
    {
        public Money ApplyCredit(Money currentBalance, Money amount)
        {
            _ = currentBalance;
            _ = amount;
            throw new InvalidOperationException("credit failed");
        }
    }

    [Fact]
    public void Restores_balances_when_apply_raises_after_debit()
    {
        var book = new CompanyAccountBook([
            new Account(AccountNumber.Parse("1111234522226789"), Money.Parse("100.00")),
            new Account(
                AccountNumber.Parse("1212343433335665"),
                Money.Parse("50.00"),
                new FailingCreditPolicy()),
        ]);
        book.Ledger = new RollingBackLedger(book);
        var instruction = TransferInstruction.Create(
            AccountNumber.Parse("1111234522226789"),
            AccountNumber.Parse("1212343433335665"),
            Money.Parse("10.00"));

        Action act = () => book.Transfer(instruction);

        act.Should().Throw<InvalidOperationException>().WithMessage("*credit failed*");
        book.BalanceFor(AccountNumber.Parse("1111234522226789"))!.Balance.ToString().Should().Be("100.00");
        book.BalanceFor(AccountNumber.Parse("1212343433335665"))!.Balance.ToString().Should().Be("50.00");
    }
}
