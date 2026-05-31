namespace MableBank.Application;

public interface ITransferJournal
{
    void Record(TransferJournalEntry entry);

    IReadOnlyList<TransferJournalEntry> Entries { get; }
}
