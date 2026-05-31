using MableBank.Domain;

namespace MableBank.Application;

public sealed record TransferJournalEntry(
    Guid RunId,
    TransferId TransferId,
    string Outcome,
    string? ReasonCode,
    TransferInstruction Instruction,
    DateTimeOffset RecordedAt);
