# ADR 006: Checkpoint and replay (sketch, not implemented)

**Status:** Proposed (production evolution; in-memory semantics in [007](007-in-memory-idempotency-and-journal.md))  
**Date:** 2026-05-30  
**Context:** Today a crash mid-file loses in-memory progress; the CLI must be rerun from row 1. Principal-track reviewers ask about recovery.

## Problem

| Scenario | Current behaviour | Risk |
| --- | --- | --- |
| Process killed after row 10,000 | Rows 1–9,999 applied in memory only; lost | Rerun reapplies all rows unless idempotent |
| Same file submitted twice | All transfers run again | Double spend |
| Partial file re-delivered | No way to resume from last good row | Long reruns, ops toil |

## Proposed design (when requirements exist)

### 1. Business idempotency key

```text
TransferInstruction + transfer_id (customer column or hash of from|to|amount|business_date)
Unique index: (company_id, transfer_id)
```

File row number is **not** the idempotency key (ADR 001).

### 2. Durable transfer journal

```text
process_run(id, file_hash, started_at, status)
transfer_outcome(run_id, transfer_id, outcome, reason, applied_at)
```

`ProcessTransfers` checks journal before apply; skipped duplicates are auditable outcomes, not silent no-ops.

### 3. Checkpoint

After each successful `apply` (or every N rows):

```text
checkpoint(run_id, last_row_number, ledger_version)
```

On restart: load balances from DB, skip rows ≤ checkpoint where outcomes already `succeeded`, re-evaluate from next row.

### 4. Atomicity boundary

Replace in-memory `RollingBackLedger` with DB transaction wrapping debit/credit + journal insert (ADR 001 revisit).

## Consequences if built

- **Positive:** Safe rerun after crash; file redelivery without double apply.
- **Negative:** Schema, migrations, ops on journal growth, reconciliation tooling required.

## Why not in this submission

Daily CSV batch with no persistence requirement; checkpoint/journal adds infrastructure before a consumer exists (ADR 001).

## Revisit when

- SLA requires resume after failure, or
- Same transfer file may be submitted more than once, or
- Balances live in our system across days (not only in daily files).
