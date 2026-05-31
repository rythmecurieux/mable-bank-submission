# ADR 005: Observability ports (logger and metrics)

**Status:** Accepted  
**Date:** 2026-05-30  
**Amended:** 2026-05-31 (typed contract, cross-language alignment)

## Context

Production batch jobs need structured logs and counters for monitoring. The CLI should stay quiet by default. Implementations must not scatter magic strings across call sites or couple the domain to a vendor SDK.

## Decision

`ProcessDay` accepts optional **logger** and **metrics** collaborators. Defaults are null implementations (no output). Tests use **recording** adapters; production would inject Datadog, OpenTelemetry, or similar **adapters** that map the contract below to their wire format.

### Normative contract (per processed transfer)

One **logical event** per transfer, emitted to both logger and metrics:

| Field | Log key | Metric tag | Values |
|-------|---------|------------|--------|
| Event / metric name | `event` | `name` | `transfer.processed` |
| Outcome | `outcome` | `outcome` | `succeeded`, `failed`, or `skipped` (lowercase) |
| Failure / skip reason | `reason_code` | `reason` | Snake-case code when failed or skipped (e.g. `insufficient_funds`, `already_processed`); omitted or null when succeeded |
| Transfer id | `transfer_id` | (none) | Business idempotency key (ADR 007) |
| Source account | `from` | (none) | Account number string |
| Destination account | `to` | (none) | Account number string |

**Logger** emits one structured entry with keys: `event`, `outcome`, `reason_code`, `from`, `to`.

**Metrics** increment counter `transfer.processed` with tags `outcome` and `reason` (reason tag only when present).

### Implementation mapping

| Stack | Contract carrier | Recording adapters |
|-------|------------------|-------------------|
| Ruby | Hash payloads in `observe_transfer` | `RecordingLogger#entries`, `RecordingMetrics#increments` |
| TypeScript | Object literals in `ProcessDay` | `RecordingLogger.entries`, `RecordingMetrics.increments` |
| .NET | `TransferProcessedTelemetry` (+ `ToLogEntry` / `ToMetricIncrement`) | `RecordingLogger.Entries`, `RecordingMetrics.Increments` |

.NET builds telemetry once in `ProcessDay` via `TransferProcessedTelemetry.FromResult(result)` and passes the same payload to `ILogger` and `IMetrics`. Adapters map to vendor formats; tests assert the normative fields via `TransferProcessedLogEntry` and `MetricIncrement`.

## Consequences

- **Positive:** Observability without coupling domain code to a vendor.
- **Positive:** CLI unchanged for reviewers (null implementations).
- **Positive:** Typed .NET carrier prevents string drift; ADR remains the cross-language source of truth.
- **Negative:** No log/metric schema **versioning** yet; add when multiple services consume events.
