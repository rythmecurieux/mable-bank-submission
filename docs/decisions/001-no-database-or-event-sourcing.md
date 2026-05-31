# ADR 001: Batch CSV processing without a database or event sourcing

**Status:** Accepted  
**Date:** 2026-05-30  
**Context:** Mable Bank ingests daily balance and transaction files for one company and prints results. The challenge is a synchronous batch job, not a multi-service platform.

## Decision

Process files in-process with an in-memory `CompanyAccountBook`. Do not introduce a database, message bus, event store, or CQRS projection pipeline for this codebase. An **in-memory** transfer journal and idempotency registry ([007](007-in-memory-idempotency-and-journal.md)) demonstrate production semantics without persistence.

## Rationale

1. **Inputs are the source of truth for the day.** Balances and instructions arrive as complete CSV files. There is no requirement to serve concurrent online transfers or retain history beyond the current run.
2. **Correctness is local and auditable.** Sequential application with explicit `TransferResult` values matches file order and is easy to test without infrastructure.
3. **Operational cost.** A DB or broker adds deploy, backup, monitoring, and schema migration work that does not solve a stated problem here.
4. **In-run idempotency is in memory only.** Duplicate business transfer ids in one file are skipped ([007](007-in-memory-idempotency-and-journal.md)); there is no durable deduplication across CLI runs until a database exists.

## Consequences

**Positive**

- Fast feedback: `bundle exec rspec`, no containers required for core logic.
- Domain rules stay testable without I/O.

**Negative / accepted**

- No crash recovery mid-file; rerun from the start.
- No cross-run audit trail (in-memory journal is lost on exit).
- All transfer results held in memory for reporting.

## Alternatives considered

| Alternative | Why not now |
| --- | --- |
| PostgreSQL + transactional transfers | Needed when balances live in the system across days |
| Durable transfer journal | Implemented in memory for demonstration ([007](007-in-memory-idempotency-and-journal.md)); persistence deferred |
| Event sourcing + projections | No consumer of an event log |
| Kafka / reactive pipeline | No concurrent writers or subscribers |

## Revisit when

- Balances must persist across days inside our system.
- The same business transfer id may arrive more than once across files or runs.
- Multiple workers process transfers against shared accounts concurrently.

Extend via narrow ports (readers, reporters) rather than adding infrastructure by default.

See also: [002: aggregate boundary](002-company-account-book-aggregate.md), [003: business failures as results](003-business-failures-as-results.md), [007: in-memory idempotency and journal](007-in-memory-idempotency-and-journal.md).
