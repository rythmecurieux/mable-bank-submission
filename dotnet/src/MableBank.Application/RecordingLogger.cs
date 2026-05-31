using MableBank.Application.Telemetry;

namespace MableBank.Application;

public sealed class RecordingLogger : ILogger
{
    public IList<TransferProcessedTelemetry> Entries { get; } = new List<TransferProcessedTelemetry>();

    public IList<TransferProcessedLogEntry> WireEntries { get; } = new List<TransferProcessedLogEntry>();

    public void LogTransferProcessed(TransferProcessedTelemetry telemetry)
    {
        ArgumentNullException.ThrowIfNull(telemetry);
        Entries.Add(telemetry);
        WireEntries.Add(telemetry.ToLogEntry());
    }
}
