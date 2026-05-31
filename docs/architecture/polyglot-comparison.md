# Polyglot comparison

**Principal polyglot delivery:** one domain model, three implementations. Same invariants, same fixture outcomes, language-appropriate tooling. This is the centrepiece for assessing portability.

**Review order (author’s professional preference):**

1. **C# / .NET** (`dotnet/`): primary stack since 2009; review first.
2. **TypeScript / Node.js** (`nodejs-typescript/`): strong use since 2018.
3. **Ruby** (`ruby/`): RSpec rubric; Ruby/Perl from first role with ongoing interest.

The three folders are **not** three products. See [author-profile.md](../author-profile.md) and [reviewer-guide.md](../reviewer-guide.md).

## Shared domain model

| Concept | Ruby | TypeScript | C# | Notes |
| --- | --- | --- | --- | --- |
| CompanyAccountBook | `Domain::CompanyAccountBook` | `CompanyAccountBook` | `CompanyAccountBook` | Aggregate; `evaluate` then `apply` / `simulate` |
| Account | `Domain::Account` | `Account` | `Account` | Entity; debit/credit |
| AccountNumber | `Domain::AccountNumber` | `AccountNumber` | `AccountNumber` | 16-digit value object |
| Money | `Domain::Money` | `Money` | `Money` | See [money handling](#money-handling) |
| TransferId | `Domain::TransferId` | `TransferId` | `TransferId` | Idempotency key ([ADR 007](../decisions/007-in-memory-idempotency-and-journal.md)) |
| TransferInstruction | `Domain::TransferInstruction` | `TransferInstruction` | `TransferInstruction` | From, to, amount, `transfer_id` |
| TransferResult | `Domain::TransferResult` | Discriminated union | `TransferResult` hierarchy | Values, not exceptions ([ADR 003](../decisions/003-business-failures-as-results.md)) |
| ProcessDay | `Application::ProcessDay` | `ProcessDay` | `ProcessDay` | Load → process → reconcile → report |
| CSV readers | `Infrastructure::Csv*` | `Csv*` | `Csv*` | RFC 4180 in TS; optional `TransferId` column |
| CLI | `bin/mable_bank` | `bin/mable-bank.ts` | `MableBank.Cli` | Composition root |

Layering is **domain → application → infrastructure → CLI** in all three. .NET enforces this with separate projects and NetArchTest; Ruby and TypeScript use folder convention plus architecture tests.

## Shared business invariants

- Valid **16-digit** account numbers.
- **Safe money** representation (no raw floats for currency arithmetic).
- Source and destination accounts must **exist**.
- Transfer amount must be **positive** and well-formed.
- Source cannot go **below zero** on success.
- **Evaluate before apply**; failed transfers do not partially mutate balances.
- **Deterministic** final balances (stable report ordering).
- Fixture files produce the **expected golden balances**.

Optional ([ADR 007](../decisions/007-in-memory-idempotency-and-journal.md)): duplicate business transfer ids in one run are **skipped** (`already_processed`). Example fixtures have no duplicate rows.

## Money handling

| Runtime | Representation |
| --- | --- |
| Ruby | `BigDecimal` via `Domain::Money` |
| TypeScript | Integer **cents** via `Money` |
| C# | `decimal` readonly struct (banker’s rounding, max 2 dp) |

Each approach avoids floating-point currency bugs when used consistently through the `Money` type.

## Testing

| Implementation | Framework | Notes |
| --- | --- | --- |
| Ruby | **RSpec** | Rubric path; SimpleCov ≥90%; `spec/architecture/` |
| TypeScript | **Vitest** | Coverage thresholds; `test/architecture/` |
| C# | **xUnit** + FluentAssertions | Coverlet 90%; NetArchTest; FsCheck on `Money` |

Approximate counts: Ruby **95+** examples; TypeScript **65+** tests; C# **45** unit + **5** architecture tests.

ADR 007 is implemented in all three for portability discussion; it is **not** required by the original brief.

## Runtime strengths (2026)

| Runtime | Strengths | Best fit |
| --- | --- | --- |
| **C# / .NET** | Strong typing, native `decimal`, refactoring, multi-project enforcement | Long-lived, high-integrity financial backends |
| **TypeScript** | Strict TS, excellent tooling, integer cents, product-team familiarity | TypeScript-first orgs; I/O-heavy services |
| **Ruby** | Expressive models, readable RSpec, low ceremony | Rubric alignment; small expressive domains |

## Review guidance

| Role | Where to look |
| --- | --- |
| **Professional depth (review first)** | `dotnet/` |
| **Second reference** | `nodejs-typescript/` |
| **RSpec rubric evidence** | `ruby/`: [challenge-rubric.md](../challenge-rubric.md) |
| **Long-lived financial-style backend** | C# / .NET is the author’s default for audit-sensitive systems |

Recruitment guidance was to use your strongest language. That order is **.NET → TypeScript → Ruby** ([author-profile.md](../author-profile.md)).

## Dev Containers and IDEs

Each stack has a lightweight Dev Container. **Open the implementation folder**, not the monorepo root. Author workflow: Rider (`dotnet/`), WebStorm (`nodejs-typescript/`), RubyMine (`ruby/`). VS Code can use the same `.devcontainer/` configs.

| Implementation | Runtime | Test | Demo |
| --- | --- | --- | --- |
| C# | .NET 9 | `dotnet test` | `./demo.sh` |
| TypeScript | Node 22 | `npm test` | `./demo.sh` |
| Ruby | Ruby 3.3 | `bundle exec rspec` | `./demo.sh` |

Full prerequisites, JetBrains steps, and troubleshooting: [reviewer-guide.md](../reviewer-guide.md#development-environment-and-ides).

## Summary

Implementations keep the **same domain model and invariants**. Differences are idiomatic expression, tooling, and runtime trade-offs. **Review C# first** for engineering depth; use **Ruby** where the rubric requires RSpec.
