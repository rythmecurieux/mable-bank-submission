using System.Globalization;
using MableBank.Domain.Errors;

namespace MableBank.Domain;

public readonly record struct Money : IComparable<Money>
{
    private const int Scale = 2;

    public decimal Amount { get; }

    private Money(decimal amount)
    {
        Amount = amount;
    }

    internal static Money FromRawAmount(decimal amount) => new(amount);

    public static Money Parse(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidMoneyAmountException("Money amount cannot be blank");
        }

        var trimmed = value.Trim();
        if (trimmed.StartsWith('-'))
        {
            throw new InvalidMoneyAmountException("Money amount cannot be negative");
        }

        var parts = trimmed.Split('.');
        if (parts.Length > 2)
        {
            throw new InvalidMoneyAmountException($"Invalid money amount: {value}");
        }

        if (parts.Length == 2)
        {
            var fractional = parts[1].TrimEnd('0');
            if (fractional.Length > Scale)
            {
                throw new InvalidMoneyAmountException($"Money supports at most {Scale} decimal places");
            }
        }

        if (!decimal.TryParse(trimmed, NumberStyles.Number, CultureInfo.InvariantCulture, out var amount))
        {
            throw new InvalidMoneyAmountException($"Invalid money amount: {value}");
        }

        amount = decimal.Round(amount, Scale, MidpointRounding.ToEven);
        if (amount < 0m)
        {
            throw new InvalidMoneyAmountException("Money amount cannot be negative");
        }

        return new Money(amount);
    }

    public static Money FromAmount(decimal amount)
    {
        var rounded = decimal.Round(amount, Scale, MidpointRounding.ToEven);
        if (rounded < 0m)
        {
            throw new InvalidMoneyAmountException("Money amount cannot be negative");
        }

        return new Money(rounded);
    }

    public static Money Zero => new(0m);

    public Money Add(Money other) => new(Amount + other.Amount);

    public Money Subtract(Money other) => new(Amount - other.Amount);

    public bool CanSubtract(Money other) => Amount >= other.Amount;

    public bool IsNegative() => Amount < 0m;

    public int CompareTo(Money other) => Amount.CompareTo(other.Amount);

    public static bool operator <(Money left, Money right) => left.CompareTo(right) < 0;

    public static bool operator >(Money left, Money right) => left.CompareTo(right) > 0;

    public static bool operator <=(Money left, Money right) => left.CompareTo(right) <= 0;

    public static bool operator >=(Money left, Money right) => left.CompareTo(right) >= 0;

    public override string ToString() => Amount.ToString("F2", CultureInfo.InvariantCulture);
}
