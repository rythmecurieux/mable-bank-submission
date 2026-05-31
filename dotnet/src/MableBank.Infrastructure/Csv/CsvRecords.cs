using CsvHelper.Configuration.Attributes;

namespace MableBank.Infrastructure.Csv;

public sealed class AccountBalanceRow
{
    public string Account { get; init; } = string.Empty;

    public string Balance { get; init; } = string.Empty;
}

public sealed class TransferRow
{
    [Optional]
    public string? TransferId { get; init; }

    public string From { get; init; } = string.Empty;

    public string To { get; init; } = string.Empty;

    public string Amount { get; init; } = string.Empty;
}
