using MableBank.Application.Telemetry;
using MableBank.Domain;

namespace MableBank.Application;

/// <summary>Orchestrates loading balances, processing transfers, observability, and reconciliation.</summary>
public sealed class ProcessDay
{
    private readonly IAccountBalanceReader _balancesReader;
    private readonly ITransferInstructionReader _transfersReader;
    private readonly bool _dryRun;
    private readonly ILogger _logger;
    private readonly IMetrics _metrics;

    public ProcessDay(
        IAccountBalanceReader balancesReader,
        ITransferInstructionReader transfersReader,
        bool dryRun = false,
        ILogger? logger = null,
        IMetrics? metrics = null)
    {
        _balancesReader = balancesReader ?? throw new ArgumentNullException(nameof(balancesReader));
        _transfersReader = transfersReader ?? throw new ArgumentNullException(nameof(transfersReader));
        _dryRun = dryRun;
        _logger = logger ?? NullLogger.Instance;
        _metrics = metrics ?? NullMetrics.Instance;
    }

    /// <summary>Runs the processing day and returns a report of outcomes and final balances.</summary>
    public Task<ProcessingReport> CallAsync(CancellationToken cancellationToken = default) =>
        CallAsyncCore(cancellationToken);

    private async Task<ProcessingReport> CallAsyncCore(CancellationToken cancellationToken)
    {
        var runId = Guid.NewGuid();
        var accountBook = await LoadAccountBalances.FromReaderAsync(_balancesReader, cancellationToken)
            .ConfigureAwait(false);
        var journal = new InMemoryTransferJournal();
        IIdempotencyRegistry? registry = _dryRun ? null : new InMemoryIdempotencyRegistry();
        var processor = new ProcessTransfers(
            accountBook,
            _dryRun,
            registry,
            journal,
            runId);
        var recorder = new TransferResultRecorder();

        await foreach (var instruction in _transfersReader
                           .ReadInstructionsAsync(cancellationToken)
                           .ConfigureAwait(false))
        {
            var result = recorder.Record(processor.Process(instruction));
            ObserveTransfer(result);
        }

        if (!_dryRun)
        {
            Reconciliation.Verify(accountBook);
        }

        return new ProcessingReport(recorder, accountBook, _dryRun, journal, runId);
    }

    private void ObserveTransfer(TransferResult result)
    {
        var telemetry = TransferProcessedTelemetry.FromResult(result);
        _metrics.RecordTransferProcessed(telemetry);
        _logger.LogTransferProcessed(telemetry);
    }
}
