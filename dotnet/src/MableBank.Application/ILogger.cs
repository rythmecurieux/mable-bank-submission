using MableBank.Application.Telemetry;

namespace MableBank.Application;

public interface ILogger
{
    void LogTransferProcessed(TransferProcessedTelemetry telemetry);
}
