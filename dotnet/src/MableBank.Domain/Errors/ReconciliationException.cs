namespace MableBank.Domain.Errors;

public sealed class ReconciliationException : DomainException
{
    public ReconciliationException(string message)
        : base(message)
    {
    }
}
