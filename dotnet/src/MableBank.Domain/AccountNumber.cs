using System.Text.RegularExpressions;
using MableBank.Domain.Errors;

namespace MableBank.Domain;

public readonly partial record struct AccountNumber
{
    [GeneratedRegex(@"^\d{16}$", RegexOptions.CultureInvariant)]
    private static partial Regex SixteenDigitsPattern();

    public string Value { get; }

    private AccountNumber(string value)
    {
        Value = value;
    }

    public static AccountNumber Parse(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidAccountNumberException("Account number cannot be blank");
        }

        var trimmed = value.Trim();
        if (!trimmed.All(char.IsDigit))
        {
            throw new InvalidAccountNumberException("Account number must contain only digits");
        }

        if (!SixteenDigitsPattern().IsMatch(trimmed))
        {
            throw new InvalidAccountNumberException("Account number must be exactly 16 digits");
        }

        return new AccountNumber(trimmed);
    }

    public override string ToString() => Value;
}
