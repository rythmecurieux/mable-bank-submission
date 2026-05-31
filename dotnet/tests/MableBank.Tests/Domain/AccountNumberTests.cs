using FluentAssertions;
using MableBank.Domain;
using MableBank.Domain.Errors;

namespace MableBank.Tests.Domain;

public sealed class AccountNumberTests
{
    [Fact]
    public void Parses_valid_sixteen_digit_numbers()
    {
        var number = AccountNumber.Parse("1111234522226789");
        number.Value.Should().Be("1111234522226789");
    }

    [Fact]
    public void Rejects_invalid_numbers()
    {
        Action blank = () => AccountNumber.Parse("   ");
        blank.Should().Throw<InvalidAccountNumberException>();

        Action shortNumber = () => AccountNumber.Parse("123");
        shortNumber.Should().Throw<InvalidAccountNumberException>();

        Action letters = () => AccountNumber.Parse("abcd123456789012");
        letters.Should().Throw<InvalidAccountNumberException>();
    }
}
