using System.Runtime.CompilerServices;
using MableBank.Application;
using MableBank.Domain;
using MableBank.Domain.Errors;
using MableBank.Infrastructure.Csv;

namespace MableBank.Infrastructure;

public sealed class CsvAccountBalanceReader : IAccountBalanceReader
{
    private readonly string _path;

    public CsvAccountBalanceReader(string path) => _path = path;

    public async IAsyncEnumerable<Account> ReadAccountsAsync(
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var rowNumber = 1;
        await foreach (var row in CsvRowReader.ReadRecordsAsync<AccountBalanceRow>(_path, cancellationToken)
                           .ConfigureAwait(false))
        {
            rowNumber++;
            yield return ParseRow(row, rowNumber);
        }
    }

    private static Account ParseRow(AccountBalanceRow row, int rowNumber)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(row.Account) || string.IsNullOrWhiteSpace(row.Balance))
            {
                throw new CsvParseException($"Row {rowNumber}: missing Account or Balance");
            }

            var accountNumber = AccountNumber.Parse(row.Account);
            var balance = Money.Parse(row.Balance);
            return new Account(accountNumber, balance);
        }
        catch (Exception ex) when (ex is CsvParseException or DomainException)
        {
            throw new CsvParseException($"Row {rowNumber}: {ex.Message}", ex);
        }
    }

}
