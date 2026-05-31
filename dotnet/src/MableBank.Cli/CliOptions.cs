namespace MableBank.Cli;

public sealed record CliOptions(bool DryRun, string BalancesPath, string TransactionsPath)
{
    public bool IsValid =>
        !string.IsNullOrWhiteSpace(BalancesPath) && !string.IsNullOrWhiteSpace(TransactionsPath);
}
