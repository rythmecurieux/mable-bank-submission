using MableBank.Application.Telemetry;

namespace MableBank.Application;

public sealed class NullLogger : ILogger
{
    public static NullLogger Instance { get; } = new();

    private NullLogger()
    {
    }

    public void LogTransferProcessed(TransferProcessedTelemetry telemetry)
    {
        _ = telemetry;
    }
}
