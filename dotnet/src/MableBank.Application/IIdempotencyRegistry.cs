using MableBank.Domain;

namespace MableBank.Application;

public interface IIdempotencyRegistry
{
    bool IsProcessed(TransferId transferId);

    void Register(TransferId transferId);
}
