# Documentation

Submission documentation for the Mable Bank backend challenge. Implementations: [`dotnet/`](../dotnet/), [`nodejs-typescript/`](../nodejs-typescript/), [`ruby/`](../ruby/).

This documentation explains what the solution does, how it is built, and why the main choices were made. If you have limited time, read [How the solution works](#how-the-solution-works), run `./demo.sh` in any stack folder, then follow links for detail.

## How the solution works

The brief asks for a program that loads account balances, applies transfers from a file, and keeps every balance at or above zero. That sounds like a small batch job, but the rules matter in practice. A failed transfer must not change any balance. The same input files must always produce the same output. Those constraints drive most of the design.

The program is a CLI. It reads two CSV files and prints updated account balances.

**Inputs**

- Opening balances: account number and amount per row
- Transfers for the day: from account, to account, amount per row

**Output**

- Final balance for each account, sorted by account number
- Transfers that fail are skipped; balances do not change for those rows

**Steps**

```text
1. Read balances CSV     →  create in-memory accounts (CompanyAccountBook)
2. Read transfers CSV    →  handle each row in file order
3. For each transfer     →  check rules, then move money only if the check passes
4. Print final balances
```

Before any money moves, the program checks that both accounts exist and the source has enough funds. If not, that row is recorded as failed and the balances stay unchanged. There is no partial debit or credit.

In payments work, partial application is how balances drift and reconciliation breaks down. The program therefore evaluates each transfer against the current book state first and applies it only when the check passes. Failed rows are reported and skipped. Later rows in the file still run. That matches how you would expect a daily transfer file to behave in production: one bad line does not stop the rest of the batch.

The code is split into layers so the transfer rules stay testable without CSV files or console output. Domain code holds the business logic. Infrastructure reads files and prints results. Application code runs the steps in order. The CLI wires dependencies and parses arguments. That separation is deliberate: the rules are the valuable part; the CSV adapter is plumbing that could change tomorrow.

**Code layout (same in every stack)**

| Layer | What it does |
| --- | --- |
| **Domain** | Transfer rules, money arithmetic, account state |
| **Application** | Load balances, run the transfer batch, build the report |
| **Infrastructure** | Read and write CSV, print to stdout |
| **CLI** | Parse arguments, wire dependencies, run the program |

The same behaviour is implemented in `dotnet/`, `nodejs-typescript/`, and `ruby/` with the same test fixtures and expected output. Everything stays in memory for this challenge. There is no database, message bus, or HTTP API. That is a scope choice: the CSV files are the source of truth for a single run, which is enough to demonstrate correct transfer handling.

Rules and invariants: [domain model](domain/domain-model.md). Layering and trade-offs: [solution design](architecture/solution-design.md).

## How this was built

I started with the domain model and invariants before writing much application code. That keeps transfer rules, money handling, and failure behaviour in one place. The three language implementations then become a portability check, not three separate designs.

The challenge is a **small synchronous CSV batch CLI**: load balances, apply transfers, print final balances. The work behind the repo:

| Step | What happened | Where |
| --- | --- | --- |
| **1. Core model** | Domain first: `Money`, `Account`, `CompanyAccountBook`, evaluate-before-apply, `TransferResult` as values not exceptions | [domain model](domain/domain-model.md), [ADRs](decisions/README.md) |
| **2. Primary implementation** | C# / .NET in **Rider**: multi-project layering, tests, CLI; realistic **~2–4 hour** take-home scope | [`dotnet/`](../dotnet/) |
| **3. Rubric stack** | Ruby in **RubyMine**: same rules, **RSpec** evidence for the published rubric | [`ruby/`](../ruby/) |
| **4. Reference stack** | TypeScript in **WebStorm**: strict TS, Vitest, same golden fixtures | [`nodejs-typescript/`](../nodejs-typescript/) |
| **5. Reviewer ergonomics** | Per-folder **Dev Containers**; **`demo.sh`** per stack; `script/test-devcontainer.sh` for Docker smoke tests | [Reviewer guide](reviewer-guide.md) |

**One domain model, three runtimes**, not three products. Day to day you ship **one stack per feature**; this repo is a **submission portfolio** (take-home + rubric + portability proof). See [Author profile (scope)](author-profile.md#submission-scope-and-intent).

The .NET folder is the primary take-home deliverable: layered projects, tests, and a CLI within a realistic time box. Ruby satisfies the published RSpec rubric. TypeScript shows the same model in another strongly typed runtime. Golden fixture tests in each stack confirm identical behaviour, so reviewers can spot-check any folder and trust the others.

**Deliberately not built:** database, Kafka, Redis, Docker Compose, web API, ORM, external services ([ADR 001](decisions/001-no-database-or-event-sourcing.md)). Those would add setup cost without helping you assess transfer rules. Where a production payments system would need idempotency, journals, or observability, those concerns appear as documented ports and ADRs, not as deployed infrastructure ([ADR 007](decisions/007-in-memory-idempotency-and-journal.md)). That is scope discipline with production awareness, not a gap in judgement.

## Run each implementation

Each stack has one `./demo.sh` script. It restores dependencies, runs tests, builds, and executes the sample CSVs through the CLI. You do not need three SDKs installed if Docker is available. When using a Dev Container, open the implementation folder, not the repo root.

| Stack | Folder | Local | Docker (no IDE) |
| --- | --- | --- | --- |
| **C# / .NET** (review first) | `dotnet/` | `./demo.sh` | `./script/test-devcontainer.sh` |
| **TypeScript** | `nodejs-typescript/` | `./demo.sh` | `./script/test-devcontainer.sh` |
| **Ruby** (RSpec rubric) | `ruby/` | `./demo.sh` | `./script/test-devcontainer.sh` |

Command tables (test, build, CLI): [Reviewer guide: terminal](reviewer-guide.md#terminal-commands-local-sdk). **Custom CSV paths:** [Run the CLI](reviewer-guide.md#run-the-cli-with-your-own-csv-files). **Dev Containers & IDEs (plain English):** [devcontainers.md](devcontainers.md).

**Expected outcome (all stacks):** 4 successful transfers; `1111234522226789: 4820.50`. Full balances: [Reviewer guide](reviewer-guide.md#expected-outcome).

Open the **implementation folder** (`dotnet/`, `nodejs-typescript/`, or `ruby/`), not only the repo root, when using a Dev Container.

## Document map

| Document | Purpose |
| --- | --- |
| [Author profile](author-profile.md) | Background, why three stacks, scope vs day-to-day |
| [Reviewer guide](reviewer-guide.md) | Commands, **custom CSV CLI**, FAQ |
| [Dev Containers guide](devcontainers.md) | **Plain-English** IDE setup, smoke tests, troubleshooting |
| [Challenge rubric](challenge-rubric.md) | RSpec checklist (`ruby/`) |
| [Solution design](architecture/solution-design.md) | Layers, flow, trade-offs |
| [Polyglot comparison](architecture/polyglot-comparison.md) | C# / TS / Ruby mapping |
| [Production roadmap](architecture/production-roadmap.md) | Evolution beyond the kata |
| [Decision records](decisions/README.md) | ADR 001–007 |
