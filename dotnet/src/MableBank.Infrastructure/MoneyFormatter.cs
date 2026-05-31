using MableBank.Domain;

namespace MableBank.Infrastructure;

public static class MoneyFormatter
{
    public static string Format(Money money) => money.ToString();
}
