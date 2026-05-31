# Solution design

## Design intent

All implementations favour **disciplined simplicity** aligned with the coding challenge. Business rules live in the domain layer; CSV parsing and console output are infrastructure; application services orchestrate without embedding rules. Production concerns are **documented** under `docs/` and in decision records; not implemented unless required.

**Review order:** [`dotnet/`](../dotnet/) (primary) → [`nodejs-typescript/`](../nodejs-typescript/) → [`ruby/`](../ruby/) (RSpec rubric). How to run: [reviewer-guide.md](../reviewer-guide.md). Build story: [README.md](../README.md#how-this-was-built).

## Layering

| Layer | Responsibility | Example locations |
| --- | --- | --- |
| **Domain** | Money, accounts, transfer rules, aggregate (`CompanyAccountBook`), `TransferResult` | `dotnet/src/MableBank.Domain/`, `nodejs-typescript/src/domain/`, `ruby/lib/mable_bank/domain/` |
| **Application** | `LoadAccountBalances`, `ProcessTransfers`, `ProcessDay`, ledgers, recorders | Per-stack `application/` (or `Application/`) |
| **Infrastructure** | CSV readers, console reporter, input validation | Per-stack `infrastructure/` |
| **CLI** | Argument parsing, wiring, exit codes | `MableBank.Cli`, `bin/mable-bank.ts`, `bin/mable_bank` |

Domain code has no knowledge of CSV format, file paths, or stdout formatting.

## Processing flow

```text
Account balances CSV
  -> CsvAccountBalanceReader (stream each_account)
  -> LoadAccountBalances
  -> CompanyAccountBook created (accounts registered)

Transfers CSV
  -> CsvTransferInstructionReader (stream each_instruction)
  -> ProcessDay
  -> ProcessTransfers (sequential)
  -> CompanyAccountBook.transfer | .simulate
  -> TransferResultRecorder (counts + failed rows)
  -> Reconciliation.verify! (live runs only)
  -> ProcessingReport
  -> ConsoleReporter (final balance report)
```

## Design trade-offs

| Decision | Rationale |
| --- | --- |
| In-memory over database | Daily CSV files are the source of truth for one run |
| Sequential processing over concurrency | Deterministic, auditable file order; no locking required |
| Direct balance update over immutable ledger | Simpler for challenge; ledger noted in production docs |
| CSV adapters over framework | Batch CLI, not a web app |
| Explicit domain objects over procedural script | Testable rules, clear boundaries |
| Production notes documented, not implemented | Avoid infrastructure theatre for scope |

## Why this is not over-engineered

- No Rails or web framework
- No database, message bus, or Docker Compose stack
- No event sourcing or distributed infrastructure
- No speculative abstractions beyond clear layers
- DDD artefacts in `docs/` support review; not extra runtime complexity
- Implementation stays aligned to the rubric: correct money, transfers, CSV, CLI, RSpec

See also: [domain-model.md](../domain/domain-model.md), [001: no database](../decisions/001-no-database-or-event-sourcing.md), [author-profile](../author-profile.md).
