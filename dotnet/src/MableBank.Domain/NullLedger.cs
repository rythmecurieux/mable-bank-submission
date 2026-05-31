namespace MableBank.Domain;

public sealed class NullLedger : ILedger
{
    public static NullLedger Instance { get; } = new();

    private NullLedger()
    {
    }

    public T Atomic<T>(Func<T> operation)
    {
        ArgumentNullException.ThrowIfNull(operation);
        return operation();
    }
}
