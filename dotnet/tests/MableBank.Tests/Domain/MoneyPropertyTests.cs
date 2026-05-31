using FsCheck.Xunit;
using MableBank.Domain;

namespace MableBank.Tests.Domain;

public sealed class MoneyPropertyTests
{
    [Property(MaxTest = 200)]
    public bool Add_is_commutative(uint leftWhole, byte leftCent, uint rightWhole, byte rightCent)
    {
        if (leftCent > 99 || rightCent > 99)
        {
            return true;
        }

        var left = ParseMoney(leftWhole, leftCent);
        var right = ParseMoney(rightWhole, rightCent);
        return left.Add(right).Equals(right.Add(left));
    }

    [Property(MaxTest = 200)]
    public bool Subtract_never_increases_balance(uint leftWhole, byte leftCent, uint rightWhole, byte rightCent)
    {
        if (leftCent > 99 || rightCent > 99)
        {
            return true;
        }

        var left = ParseMoney(leftWhole, leftCent);
        var right = ParseMoney(rightWhole, rightCent);
        if (!left.CanSubtract(right))
        {
            return true;
        }

        return left.Subtract(right).CompareTo(left) <= 0;
    }

    [Property(MaxTest = 200)]
    public bool Parse_round_trips_two_decimal_format(uint whole, byte cent)
    {
        if (cent > 99)
        {
            return true;
        }

        var formatted = ParseMoney(whole, cent).ToString();
        return Money.Parse(formatted).Equals(ParseMoney(whole, cent));
    }

    private static Money ParseMoney(uint whole, byte cent) => Money.Parse($"{whole}.{cent:00}");
}
