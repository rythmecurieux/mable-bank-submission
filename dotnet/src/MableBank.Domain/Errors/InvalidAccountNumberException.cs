namespace MableBank.Domain.Errors;

public sealed class InvalidAccountNumberException : DomainException
{
    public InvalidAccountNumberException(string message)
        : base(message)
    {
    }
}
