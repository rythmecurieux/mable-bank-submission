using MableBank.Domain;

namespace MableBank.Application;

public sealed class InMemoryIdempotencyRegistry : IIdempotencyRegistry
{
    private readonly HashSet<string> _processed = new(StringComparer.Ordinal);

    public bool IsProcessed(TransferId transferId)
    {
        ArgumentNullException.ThrowIfNull(transferId);
        return _processed.Contains(transferId.Value);
    }

    public void Register(TransferId transferId)
    {
        ArgumentNullException.ThrowIfNull(transferId);
        _processed.Add(transferId.Value);
    }
}
