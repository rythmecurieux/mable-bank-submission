using MableBank.Domain;

namespace MableBank.Application;

public static class LoadAccountBalances
{
    public static async Task<CompanyAccountBook> FromReaderAsync(
        IAccountBalanceReader reader,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(reader);
        var book = new CompanyAccountBook();
        await foreach (var account in reader.ReadAccountsAsync(cancellationToken).ConfigureAwait(false))
        {
            book.AddAccount(account);
        }

        book.Ledger = new RollingBackLedger(book);
        return book;
    }
}
