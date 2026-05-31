using MableBank.Application.Telemetry;

namespace MableBank.Application;

public sealed class NullMetrics : IMetrics
{
    public static NullMetrics Instance { get; } = new();

    private NullMetrics()
    {
    }

    public void RecordTransferProcessed(TransferProcessedTelemetry telemetry)
    {
        _ = telemetry;
    }
}
