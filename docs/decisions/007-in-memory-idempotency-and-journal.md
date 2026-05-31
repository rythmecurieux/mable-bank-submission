# ADR 007: In-memory idempotency and transfer journal

**Status:** Accepted  
**Date:** 2026-05-31  
**Related:** [006](006-checkpoint-and-replay-sketch.md) (durable evolution), [003](003-business-failures-as-results.md), [005](005-observability-ports.md)

## Context

Principal-track reviewers expect **business idempotency keys** and an **auditable transfer journal**, not only in-memory balances. ADR 006 sketches persistence; this ADR implements the **same semantics in memory** so the kata demonstrates payments-grade behaviour without a database.

## Decision

### 1. Transfer id

Every `TransferInstruction` carries a `TransferId`:

- **Customer-supplied:** optional CSV column `TransferId` (trimmed, non-empty).
- **Derived (default):** SHA-256 hex of `from|to|amount` with amount formatted to two decimal places (invariant culture). Same triple → same id across file redelivery.

Row number is **not** the idempotency key (ADR 006).

### 2. Idempotency registry (application port)

Before `transfer` / `simulate`, `ProcessTransfers` checks `IdempotencyRegistry#seen?`. If seen, returns `TransferResult` **skipped** with `reason_code: already_processed`; auditable, no balance mutation, no double apply.

On **successful** non-dry-run apply, register the id. Dry-run does **not** register (replay-safe simulation).

### 3. Transfer journal (application port)

`TransferJournal#record` appends one entry per processed row: `run_id`, `transfer_id`, outcome (`succeeded` | `failed` | `skipped`), `reason_code`, instruction snapshot, `recorded_at`.

Production swaps `InMemory*` adapters for DB tables from ADR 006; `ProcessDay` orchestration unchanged.

### 4. Observability

Skipped transfers emit `transfer.processed` with `outcome: skipped` and `reason_code: already_processed` (ADR 005 amended).

## Consequences

- **Positive:** File redelivery and duplicate rows do not double-spend; journal is inspectable in tests.
- **Positive:** Same ports and flow as production evolution path.
- **Negative:** Journal is lost on process exit; acceptable until ADR 006 persistence.

## Revisit when

Persist `process_run` and `transfer_outcome` tables; registry becomes unique index on `(company_id, transfer_id)`.
