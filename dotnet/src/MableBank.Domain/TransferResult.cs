namespace MableBank.Domain;

public enum TransferFailureReason
{
    SourceNotFound,
    DestinationNotFound,
    InsufficientFunds,
}

public abstract record TransferResult(TransferInstruction Instruction)
{
    public virtual string? ReasonCode => null;

    private static readonly Dictionary<TransferFailureReason, string> ReasonMessages = new()
    {
        [TransferFailureReason.SourceNotFound] = "Source account not found",
        [TransferFailureReason.DestinationNotFound] = "Destination account not found",
        [TransferFailureReason.InsufficientFunds] = "Insufficient funds",
    };

    public bool IsSuccess => this is TransferSuccess;

    public bool IsFailure => this is TransferFailureResult;

    public bool IsSkipped => this is TransferSkippedResult;

    public static TransferSuccess CreateSuccess(TransferInstruction instruction) => new(instruction);

    public static TransferFailureResult CreateFailure(
        TransferInstruction instruction,
        TransferFailureReason reason) =>
        new(instruction, reason, ReasonMessages[reason]);

    public static TransferSkippedResult CreateSkipped(TransferInstruction instruction) =>
        new(instruction);
}

public sealed record TransferSuccess(TransferInstruction Instruction) : TransferResult(Instruction);

public sealed record TransferFailureResult(
    TransferInstruction Instruction,
    TransferFailureReason Reason,
    string Message) : TransferResult(Instruction)
{
    public override string? ReasonCode => Reason switch
    {
        TransferFailureReason.SourceNotFound => "source_not_found",
        TransferFailureReason.DestinationNotFound => "destination_not_found",
        TransferFailureReason.InsufficientFunds => "insufficient_funds",
        _ => null,
    };
}

public sealed record TransferSkippedResult(TransferInstruction Instruction) : TransferResult(Instruction)
{
    public override string? ReasonCode => "already_processed";
}
