namespace MableBank.Domain.Errors;

public sealed class InvalidTransferInstructionException : DomainException
{
    public InvalidTransferInstructionException(string message)
        : base(message)
    {
    }
}
