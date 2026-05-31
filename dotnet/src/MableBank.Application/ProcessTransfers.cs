using MableBank.Domain;

namespace MableBank.Application;

public sealed class ProcessTransfers
{
    private readonly CompanyAccountBook _accountBook;
    private readonly bool _dryRun;
    private readonly IIdempotencyRegistry? _idempotencyRegistry;
    private readonly ITransferJournal? _transferJournal;
    private readonly Guid? _runId;

    public ProcessTransfers(
        CompanyAccountBook accountBook,
        bool dryRun = false,
        IIdempotencyRegistry? idempotencyRegistry = null,
        ITransferJournal? transferJournal = null,
        Guid? runId = null)
    {
        _accountBook = accountBook ?? throw new ArgumentNullException(nameof(accountBook));
        _dryRun = dryRun;
        _idempotencyRegistry = idempotencyRegistry;
        _transferJournal = transferJournal;
        _runId = runId;
    }

    public TransferResult Process(TransferInstruction instruction)
    {
        ArgumentNullException.ThrowIfNull(instruction);
        if (_idempotencyRegistry?.IsProcessed(instruction.TransferId) == true)
        {
            var skipped = TransferResult.CreateSkipped(instruction);
            JournalRecord(skipped);
            return skipped;
        }

        var result = _dryRun
            ? _accountBook.Simulate(instruction)
            : _accountBook.Transfer(instruction);

        if (result.IsSuccess && !_dryRun)
        {
            _idempotencyRegistry?.Register(instruction.TransferId);
        }

        JournalRecord(result);
        return result;
    }

    public IReadOnlyList<TransferResult> ProcessAll(IEnumerable<TransferInstruction> instructions) =>
        instructions.Select(Process).ToList();

    private void JournalRecord(TransferResult result)
    {
        if (_transferJournal is null || _runId is null)
        {
            return;
        }

        var outcome = result switch
        {
            TransferSuccess => "succeeded",
            TransferSkippedResult => "skipped",
            _ => "failed",
        };

        _transferJournal.Record(new TransferJournalEntry(
            _runId.Value,
            result.Instruction.TransferId,
            outcome,
            result.ReasonCode,
            result.Instruction,
            DateTimeOffset.UtcNow));
    }
}
