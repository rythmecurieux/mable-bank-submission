using MableBank.Domain;

namespace MableBank.Application.Telemetry;

public enum TransferOutcome
{
    Succeeded,
    Failed,
    Skipped,
}

/// <summary>
/// Strongly typed observability payload for a processed transfer (ADR 005).
/// Use <see cref="ToLogEntry"/> and <see cref="ToMetricIncrement"/> for vendor adapters.
/// </summary>
public sealed record TransferProcessedTelemetry(
    TransferOutcome Outcome,
    string? ReasonCode,
    TransferId TransferId,
    AccountNumber From,
    AccountNumber To)
{
    public const string MetricName = "transfer.processed";

    public const string EventName = "transfer.processed";

    /// <summary>ADR 005 outcome wire value: <c>succeeded</c>, <c>failed</c>, or <c>skipped</c>.</summary>
    public string OutcomeWire => Outcome switch
    {
        TransferOutcome.Succeeded => "succeeded",
        TransferOutcome.Failed => "failed",
        TransferOutcome.Skipped => "skipped",
        _ => throw new InvalidOperationException($"Unknown outcome: {Outcome}"),
    };

    public static TransferProcessedTelemetry FromResult(TransferResult result)
    {
        ArgumentNullException.ThrowIfNull(result);
        var outcome = result switch
        {
            TransferSuccess => TransferOutcome.Succeeded,
            TransferSkippedResult => TransferOutcome.Skipped,
            _ => TransferOutcome.Failed,
        };
        return new TransferProcessedTelemetry(
            outcome,
            result.ReasonCode,
            result.Instruction.TransferId,
            result.Instruction.FromAccountNumber,
            result.Instruction.ToAccountNumber);
    }

    public TransferProcessedLogEntry ToLogEntry() =>
        new(EventName, OutcomeWire, ReasonCode, TransferId.Value, From.Value, To.Value);

    public MetricIncrement ToMetricIncrement() =>
        new(MetricName, OutcomeWire, ReasonCode);
}
