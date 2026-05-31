namespace MableBank.Application;

public sealed class InMemoryTransferJournal : ITransferJournal
{
    private readonly List<TransferJournalEntry> _entries = [];

    public IReadOnlyList<TransferJournalEntry> Entries => _entries;

    public void Record(TransferJournalEntry entry)
    {
        ArgumentNullException.ThrowIfNull(entry);
        _entries.Add(entry);
    }
}
