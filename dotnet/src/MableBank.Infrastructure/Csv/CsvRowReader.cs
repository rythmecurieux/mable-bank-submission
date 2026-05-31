using System.Globalization;
using System.Runtime.CompilerServices;
using CsvHelper;
using CsvHelper.Configuration;

namespace MableBank.Infrastructure.Csv;

internal static class CsvRowReader
{
    internal static CsvConfiguration Configuration { get; } = new(CultureInfo.InvariantCulture)
    {
        HasHeaderRecord = true,
        TrimOptions = TrimOptions.Trim,
        BadDataFound = null,
        MissingFieldFound = null,
    };

    internal static async IAsyncEnumerable<TRecord> ReadRecordsAsync<TRecord>(
        string path,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        if (!File.Exists(path))
        {
            throw new CsvParseException($"File not found: {path}");
        }

        var hasRow = false;
        await using var stream = new FileStream(
            path,
            new FileStreamOptions
            {
                Mode = FileMode.Open,
                Access = FileAccess.Read,
                Share = FileShare.Read,
                Options = FileOptions.Asynchronous,
            });
        using var reader = new StreamReader(stream);
        using var csv = new CsvReader(reader, Configuration);
        await foreach (var record in csv.GetRecordsAsync<TRecord>(cancellationToken).ConfigureAwait(false))
        {
            hasRow = true;
            yield return record;
        }

        if (!hasRow)
        {
            throw new CsvParseException($"CSV file is empty: {path}");
        }
    }
}
