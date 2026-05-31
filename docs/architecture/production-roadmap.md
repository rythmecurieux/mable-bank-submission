# Production roadmap

How this batch CLI would grow if it left the take-home scope. Order matters: each step unlocks the next. Decision records: [007](../decisions/007-in-memory-idempotency-and-journal.md), [006](../decisions/006-checkpoint-and-replay-sketch.md), [005](../decisions/005-observability-ports.md), [004](../decisions/004-synchronous-sequential-execution.md).

```text
[ CSV batch CLI today; in-memory journal + idempotency (ADR 007) ]
        │
        ▼
① Persistence: accounts + immutable transfer log; DB transaction per apply
        │
        ▼
② Idempotency (durable): unique constraint on business transfer_id in DB
        │
        ▼
③ Checkpoint: resume after crash; last_row + run_id (ADR 006)
        │
        ▼
④ Partition / lock: one worker per company or account shard if parallel
        │
        ▼
⑤ Observability: wire logger/metrics ports (ADR 005); SLOs on declines + latency
        │
        ▼
⑥ Reconciliation: nightly job: file totals vs ledger; alert on drift
```

| Phase | Delivers | Depends on |
| --- | --- | --- |
| **Persistence** | Crash-safe balances; audit trail | Product owns accounts across days |
| **Idempotency** | Safe file redelivery | Customer-supplied or agreed transfer keys |
| **Checkpoint** | Resume mid-file | Journal + persistence |
| **Partition / lock** | Throughput without corrupting accounts | Multi-worker requirement |
| **Observability** | Debug 2am batch failures | Ports already in `ProcessDay` |
| **Reconciliation** | Finance trust | Durable log + reporting |

**Stay sync sequential** until ④ forces parallelism ([ADR 004](../decisions/004-synchronous-sequential-execution.md)). Async I/O to payment rails is an adapter inside `apply`, not a rewrite to event sourcing.
