namespace MableBank.Domain;

public sealed class DefaultCreditPolicy : ICreditPolicy
{
    public static DefaultCreditPolicy Instance { get; } = new();

    private DefaultCreditPolicy()
    {
    }

    public Money ApplyCredit(Money currentBalance, Money amount) => currentBalance.Add(amount);
}
