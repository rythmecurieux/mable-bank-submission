namespace MableBank.Domain.Errors;

public sealed class InvalidMoneyAmountException : DomainException
{
    public InvalidMoneyAmountException(string message)
        : base(message)
    {
    }
}
