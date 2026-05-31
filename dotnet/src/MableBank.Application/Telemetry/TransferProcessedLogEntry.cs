namespace MableBank.Application.Telemetry;

/// <summary>Wire-shaped log entry for ADR 005 (event, outcome, reason_code, transfer_id, from, to).</summary>
public sealed record TransferProcessedLogEntry(
    string Event,
    string Outcome,
    string? ReasonCode,
    string TransferId,
    string From,
    string To);
