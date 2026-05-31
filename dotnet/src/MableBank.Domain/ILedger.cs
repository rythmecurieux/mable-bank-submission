namespace MableBank.Domain;

public interface ILedger
{
    T Atomic<T>(Func<T> operation);

    void Atomic(Action operation) => Atomic(() =>
    {
        operation();
        return 0;
    });
}
