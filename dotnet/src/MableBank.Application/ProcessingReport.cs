using MableBank.Domain;

namespace MableBank.Application;

public sealed class ProcessingReport
{
    public ProcessingReport(
        TransferResultRecorder recorder,
        CompanyAccountBook accountBook,
        bool dryRun,
        ITransferJournal? transferJournal = null,
        Guid? runId = null)
    {
        Recorder = recorder;
        AccountBook = accountBook;
        DryRun = dryRun;
        TransferJournal = transferJournal;
        RunId = runId;
    }

    public TransferResultRecorder Recorder { get; }

    public CompanyAccountBook AccountBook { get; }

    public bool DryRun { get; }

    public ITransferJournal? TransferJournal { get; }

    public Guid? RunId { get; }

    public IReadOnlyList<AccountBalance> FinalBalances => AccountBook.FinalBalances();

    public int ProcessedCount => Recorder.ProcessedCount;

    public int SucceededCount => Recorder.SucceededCount;

    public int FailedCount => Recorder.FailedCount;

    public IReadOnlyList<TransferResult> FailedResults => Recorder.FailedResults;

    public int SkippedCount => Recorder.SkippedCount;

    public IReadOnlyList<TransferJournalEntry> JournalEntries =>
        TransferJournal?.Entries ?? [];
}
