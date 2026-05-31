using MableBank.Application.Telemetry;

namespace MableBank.Application;

public sealed class RecordingMetrics : IMetrics
{
    public IList<TransferProcessedTelemetry> Records { get; } = new List<TransferProcessedTelemetry>();

    public IList<MetricIncrement> Increments { get; } = new List<MetricIncrement>();

    public void RecordTransferProcessed(TransferProcessedTelemetry telemetry)
    {
        ArgumentNullException.ThrowIfNull(telemetry);
        Records.Add(telemetry);
        Increments.Add(telemetry.ToMetricIncrement());
    }
}
