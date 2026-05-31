using MableBank.Application;
using MableBank.Domain;

namespace MableBank.Infrastructure;

public static class ConsoleReporter
{
    public static string FormatReport(ProcessingReport report)
    {
        ArgumentNullException.ThrowIfNull(report);
        var lines = new List<string>
        {
            report.DryRun
                ? "Mable Bank Transfer Processing (dry run)"
                : "Mable Bank Transfer Processing",
            string.Empty,
            $"Transfers processed: {report.ProcessedCount}",
            $"Successful transfers: {report.SucceededCount}",
            $"Failed transfers: {report.FailedCount}",
        };

        if (report.SkippedCount > 0)
        {
            lines.Add($"Skipped transfers (already processed): {report.SkippedCount}");
        }

        if (report.DryRun)
        {
            lines.Add("No balances were mutated during dry run.");
        }

        lines.Add(string.Empty);
        lines.Add("Final balances:");

        foreach (var snapshot in report.FinalBalances)
        {
            lines.Add($"{snapshot.AccountNumber}: {MoneyFormatter.Format(snapshot.Balance)}");
        }

        var failures = report.FailedResults.OfType<TransferFailureResult>().ToList();
        if (failures.Count > 0)
        {
            lines.Add(string.Empty);
            lines.Add("Failed transfers:");
            for (var index = 0; index < failures.Count; index++)
            {
                var failure = failures[index];
                var instruction = failure.Instruction;
                lines.Add(
                    $"{index + 1}. From {instruction.FromAccountNumber} to {instruction.ToAccountNumber} " +
                    $"for {MoneyFormatter.Format(instruction.Amount)} - {failure.Message}");
            }
        }

        return string.Join(Environment.NewLine, lines);
    }
}
