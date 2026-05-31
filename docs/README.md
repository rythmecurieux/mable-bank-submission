# Documentation

Submission documentation for the Mable Bank backend challenge. Implementations: [`dotnet/`](../dotnet/), [`nodejs-typescript/`](../nodejs-typescript/), [`ruby/`](../ruby/).

## How this was built

The challenge is a **small synchronous CSV batch CLI** — load balances, apply transfers, print final balances. The work behind the repo:

| Step | What happened | Where |
| --- | --- | --- |
| **1. Core model** | Domain first: `Money`, `Account`, `CompanyAccountBook`, evaluate-before-apply, `TransferResult` as values not exceptions | [domain model](domain/domain-model.md), [ADRs](decisions/README.md) |
| **2. Primary implementation** | C# / .NET in **Rider** — multi-project layering, tests, CLI; realistic **~2–4 hour** take-home scope | [`dotnet/`](../dotnet/) |
| **3. Rubric stack** | Ruby in **RubyMine** — same rules, **RSpec** evidence for the published rubric | [`ruby/`](../ruby/) |
| **4. Reference stack** | TypeScript in **WebStorm** — strict TS, Vitest, same golden fixtures | [`nodejs-typescript/`](../nodejs-typescript/) |
| **5. Reviewer ergonomics** | Per-folder **Dev Containers**; **`demo.sh`** per stack; `script/test-devcontainer.sh` for Docker smoke tests | [Reviewer guide](reviewer-guide.md) |

**One domain model, three runtimes** — not three products. Day to day you ship **one stack per feature**; this repo is a **submission portfolio** (take-home + rubric + portability proof). See [Author profile — scope](author-profile.md#submission-scope-and-intent).

**Deliberately not built:** database, Kafka, Redis, Docker Compose, web API, ORM, external services ([ADR 001](decisions/001-no-database-or-event-sourcing.md)). Optional in-process extras (idempotency journal, observability ports) support payments discussion — documented, not production infra ([ADR 007](decisions/007-in-memory-idempotency-and-journal.md)).

## Run each implementation

| Stack | Folder | Local | Docker (no IDE) |
| --- | --- | --- | --- |
| **C# / .NET** (review first) | `dotnet/` | `./demo.sh` | `./script/test-devcontainer.sh` |
| **TypeScript** | `nodejs-typescript/` | `./demo.sh` | `./script/test-devcontainer.sh` |
| **Ruby** (RSpec rubric) | `ruby/` | `./demo.sh` | `./script/test-devcontainer.sh` |

Command tables (test, build, CLI): [Reviewer guide — terminal](reviewer-guide.md#terminal-commands-local-sdk). **Custom CSV paths:** [Run the CLI](reviewer-guide.md#run-the-cli-with-your-own-csv-files). **Dev Containers & IDEs (plain English):** [devcontainers.md](devcontainers.md).

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
