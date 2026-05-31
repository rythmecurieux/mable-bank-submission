namespace MableBank.Domain;

/// <summary>Applies a credit to an account balance.</summary>
public interface ICreditPolicy
{
    Money ApplyCredit(Money currentBalance, Money amount);
}
