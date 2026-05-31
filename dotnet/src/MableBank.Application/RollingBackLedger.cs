using MableBank.Domain;

namespace MableBank.Application;

public sealed class RollingBackLedger : ILedger
{
    private readonly CompanyAccountBook _accountBook;

    public RollingBackLedger(CompanyAccountBook accountBook)
    {
        _accountBook = accountBook ?? throw new ArgumentNullException(nameof(accountBook));
    }

    public T Atomic<T>(Func<T> operation)
    {
        ArgumentNullException.ThrowIfNull(operation);
        var snapshot = _accountBook.CaptureBalanceSnapshot();
        try
        {
            return operation();
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _accountBook.RestoreBalanceSnapshot(snapshot);
            throw;
        }
    }
}
