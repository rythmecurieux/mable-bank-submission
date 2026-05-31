namespace MableBank.Domain.Errors;

public sealed class InsufficientFundsException : DomainException
{
    public InsufficientFundsException(string message)
        : base(message)
    {
    }
}
