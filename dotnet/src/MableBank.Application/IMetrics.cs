using MableBank.Application.Telemetry;

namespace MableBank.Application;

/// <summary>Wire-shaped metric increment for ADR 005 (name, outcome, reason tags).</summary>
public sealed record MetricIncrement(string Name, string Outcome, string? Reason);

public interface IMetrics
{
    void RecordTransferProcessed(TransferProcessedTelemetry telemetry);
}
