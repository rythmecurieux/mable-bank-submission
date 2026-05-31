using System.CommandLine;
using MableBank.Application;
using MableBank.Domain.Errors;
using MableBank.Infrastructure;

namespace MableBank.Cli;

public static class CliHost
{
    private static readonly Option<bool> DryRunOption = new("--dry-run")
    {
        Description = "Simulate transfers without mutating balances or running reconciliation",
    };

    private static readonly Argument<string> BalancesArgument = new("balances")
    {
        Description = "Path to account balances CSV",
    };

    private static readonly Argument<string> TransactionsArgument = new("transactions")
    {
        Description = "Path to transactions CSV",
    };

    public static Task<int> RunAsync(string[] args) =>
        BuildRootCommand().Parse(args).InvokeAsync();

    internal static RootCommand BuildRootCommand()
    {
        var root = new RootCommand("Mable Bank: process daily transfers from CSV files");
        root.Options.Add(DryRunOption);
        root.Arguments.Add(BalancesArgument);
        root.Arguments.Add(TransactionsArgument);
        root.SetAction(async (parseResult, cancellationToken) => await ExecuteAsync(
            parseResult.GetValue(DryRunOption),
            parseResult.GetValue(BalancesArgument) ?? string.Empty,
            parseResult.GetValue(TransactionsArgument) ?? string.Empty,
            cancellationToken).ConfigureAwait(false));
        return root;
    }

    private static async Task<int> ExecuteAsync(
        bool dryRun,
        string balancesPath,
        string transactionsPath,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(balancesPath) || string.IsNullOrWhiteSpace(transactionsPath))
        {
            await Console.Error.WriteLineAsync("Both balances and transactions CSV paths are required.")
                .ConfigureAwait(false);
            return 1;
        }

        try
        {
            var report = await RunProcessingDayAsync(
                    new CliOptions(dryRun, balancesPath, transactionsPath),
                    cancellationToken)
                .ConfigureAwait(false);
            await Console.Out.WriteLineAsync(ConsoleReporter.FormatReport(report)).ConfigureAwait(false);
            return 0;
        }
        catch (CsvParseException ex)
        {
            await Console.Error.WriteLineAsync($"Error: {ex.Message}").ConfigureAwait(false);
            return 1;
        }
        catch (InputFileValidationException ex)
        {
            await Console.Error.WriteLineAsync($"Error: {ex.Message}").ConfigureAwait(false);
            return 1;
        }
        catch (DomainException ex)
        {
            await Console.Error.WriteLineAsync($"Error: {ex.Message}").ConfigureAwait(false);
            return 1;
        }
    }

    public static async Task<ProcessingReport> RunProcessingDayAsync(
        CliOptions options,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(options);
        var balancesPath = InputFile.Validate(options.BalancesPath);
        var transactionsPath = InputFile.Validate(options.TransactionsPath);

        return await new ProcessDay(
            balancesReader: new CsvAccountBalanceReader(balancesPath),
            transfersReader: new CsvTransferInstructionReader(transactionsPath),
            dryRun: options.DryRun).CallAsync(cancellationToken).ConfigureAwait(false);
    }
}
