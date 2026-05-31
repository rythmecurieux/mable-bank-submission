# Solution design

## Design intent

The challenge is a batch CLI, not a production bank. The goal is to show correct transfer handling, clear boundaries, and sound judgement about scope. Business rules live in the domain layer. CSV parsing and console output sit in infrastructure. Application services coordinate the steps without embedding rules.

Simplicity here is a choice, not a shortcut. A database, web framework, or message bus would make the repo harder to run and would not help you assess whether transfers are applied safely. Production concerns (persistence, idempotency at scale, observability) are documented under `docs/` and in decision records so you can see how this design would evolve. They are not implemented unless the brief requires them.

**Review order:** [`dotnet/`](../dotnet/) (primary) → [`nodejs-typescript/`](../nodejs-typescript/) → [`ruby/`](../ruby/) (RSpec rubric). How to run: [reviewer-guide.md](../reviewer-guide.md). Build story: [README.md](../README.md#how-this-was-built).

## Layering

Layers keep the transfer rules testable in isolation. You can unit test `CompanyAccountBook` without reading a CSV file or capturing stdout. You can test CSV parsing without knowing whether insufficient funds should fail a transfer. That separation reduces coupling and makes regressions easier to locate.

| Layer | Responsibility | Example locations |
| --- | --- | --- |
| **Domain** | Money, accounts, transfer rules, aggregate (`CompanyAccountBook`), `TransferResult` | `dotnet/src/MableBank.Domain/`, `nodejs-typescript/src/domain/`, `ruby/lib/mable_bank/domain/` |
| **Application** | `LoadAccountBalances`, `ProcessTransfers`, `ProcessDay`, ledgers, recorders | Per-stack `application/` (or `Application/`) |
| **Infrastructure** | CSV readers, console reporter, input validation | Per-stack `infrastructure/` |
| **CLI** | Argument parsing, wiring, exit codes | `MableBank.Cli`, `bin/mable-bank.ts`, `bin/mable_bank` |

Domain code has no knowledge of CSV format, file paths, or stdout formatting. If the input format changed from CSV to JSON, only infrastructure and wiring would change. The transfer rules would stay the same.

## Processing flow

Processing is synchronous and sequential. Each transfer row sees the balances left by earlier rows in the same file. That matches the brief and keeps behaviour easy to reason about and test. There is no concurrency, locking, or retry logic because none is required for a single-process batch job.

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

Each row below is a conscious trade-off for this challenge. The left column is what was chosen; the right column is why. None of these choices claim that production would look identical. They claim that adding more moving parts here would cost reviewer time without improving assessment of the core problem.

| Decision | Rationale |
| --- | --- |
| In-memory over database | Daily CSV files are the source of truth for one run |
| Sequential processing over concurrency | Deterministic, auditable file order; no locking required |
| Direct balance update over immutable ledger | Simpler for challenge; ledger noted in production docs |
| CSV adapters over framework | Batch CLI, not a web app |
| Explicit domain objects over procedural script | Testable rules, clear boundaries |
| Production notes documented, not implemented | Avoid infrastructure theatre for scope |

## Why this is not over-engineered

The structure above is enough to test business rules, run the CLI, and explain decisions to a reviewer. The list below names what was left out on purpose. DDD artefacts in `docs/` support that conversation. They are not extra runtime complexity bolted onto a kata.

- No Rails or web framework
- No database, message bus, or Docker Compose stack
- No event sourcing or distributed infrastructure
- No speculative abstractions beyond clear layers
- DDD artefacts in `docs/` support review; not extra runtime complexity
- Implementation stays aligned to the rubric: correct money, transfers, CSV, CLI, RSpec

See also: [domain-model.md](../domain/domain-model.md), [001: no database](../decisions/001-no-database-or-event-sourcing.md), [author-profile](../author-profile.md).
