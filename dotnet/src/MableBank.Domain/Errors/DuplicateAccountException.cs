namespace MableBank.Domain.Errors;

public sealed class DuplicateAccountException : DomainException
{
    public DuplicateAccountException(string message)
        : base(message)
    {
    }
}
