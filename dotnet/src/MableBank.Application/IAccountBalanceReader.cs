using MableBank.Domain;

namespace MableBank.Application;

public interface IAccountBalanceReader
{
    IAsyncEnumerable<Account> ReadAccountsAsync(CancellationToken cancellationToken = default);
}
