using MableBank.Domain.Errors;

namespace MableBank.Domain;

public sealed class Account
{
    private readonly ICreditPolicy _creditPolicy;

    public Account(
        AccountNumber accountNumber,
        Money balance,
        ICreditPolicy? creditPolicy = null)
    {
        AccountNumber = accountNumber;
        Balance = balance;
        _creditPolicy = creditPolicy ?? DefaultCreditPolicy.Instance;
    }

    public AccountNumber AccountNumber { get; }

    public Money Balance { get; private set; }

    public bool CanDebit(Money amount) => Balance.CanSubtract(amount);

    public void Credit(Money amount) =>
        Balance = _creditPolicy.ApplyCredit(Balance, amount);

    public void Debit(Money amount)
    {
        if (!CanDebit(amount))
        {
            throw new InsufficientFundsException("Insufficient funds");
        }

        Balance = Balance.Subtract(amount);
    }

    public void ReplaceBalance(Money balance) => Balance = balance;

    public Account Copy() => new(AccountNumber, Balance, _creditPolicy);
}
