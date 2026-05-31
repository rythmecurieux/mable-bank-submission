using FluentAssertions;
using MableBank.Domain;
using MableBank.Domain.Errors;

namespace MableBank.Tests.Domain;

public sealed class MoneyTests
{
    [Fact]
    public void Parses_decimal_strings_with_two_places()
    {
        Money.Parse("10.50").ToString().Should().Be("10.50");
        Money.Parse("25").ToString().Should().Be("25.00");
    }

    [Fact]
    public void Adds_and_subtracts_without_float_drift()
    {
        var left = Money.Parse("0.10");
        var right = Money.Parse("0.20");
        left.Add(right).ToString().Should().Be("0.30");
        Money.Parse("10.00").Subtract(Money.Parse("3.25")).ToString().Should().Be("6.75");
    }

    [Fact]
    public void Compares_values()
    {
        Money.Parse("1.00").CompareTo(Money.Parse("2.00")).Should().BeLessThan(0);
    }

    [Fact]
    public void Rejects_negative_and_invalid_values()
    {
        var parse = () => Money.Parse("abc");
        parse.Should().Throw<InvalidMoneyAmountException>();

        Action blank = () => Money.Parse("   ");
        blank.Should().Throw<InvalidMoneyAmountException>();

        Action negative = () => Money.Parse("-1.00");
        negative.Should().Throw<InvalidMoneyAmountException>();

        Action scale = () => Money.Parse("1.234");
        scale.Should().Throw<InvalidMoneyAmountException>();
    }
}
