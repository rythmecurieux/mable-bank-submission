# Author profile

Principal engineer submission: Mable Bank transfer-processing challenge.

This page gives context on background, scope, and intent. The code and tests are the primary evidence. This documentation explains why the repo is structured the way it is and what it is not trying to be.

## How this was developed

Work proceeded **domain-first**, then one implementation at a time in the IDE used day to day for that stack:

```text
Shared domain model (docs + invariants)
    → C# / .NET in Rider          (primary deliverable)
    → Ruby in RubyMine            (RSpec rubric)
    → TypeScript in WebStorm      (optional reference)
    → Per-stack Dev Containers    (repeatable review, no Compose)
```

| Phase | Environment | Outcome |
| --- | --- | --- |
| Modelling | `docs/domain/`, ADRs | Ubiquitous language, aggregate boundary, non-goals |
| .NET | Rider + `dotnet/` Dev Container | CLI, tests, NetArchTest, fixture golden balances |
| Ruby | RubyMine + `ruby/` Dev Container | Same rules; RSpec rubric evidence |
| TypeScript | WebStorm + `nodejs-typescript/` Dev Container | Same rules; `./demo.sh` (or `npm run verify` for full CI) |

VS Code can use the same `.devcontainer/` configs: open **`dotnet/`**, **`nodejs-typescript/`**, or **`ruby/`** (not the monorepo root). Run steps: [reviewer-guide.md](reviewer-guide.md).

## Submission scope and intent

| Artifact | Role |
| --- | --- |
| [`dotnet/`](../dotnet/) + core `docs/` | **Primary deliverable** for a timed take-home (~2–4 hours focused) |
| [`ruby/`](../ruby/) | **Rubric alignment**: RSpec required by the brief |
| [`nodejs-typescript/`](../nodejs-typescript/) | **Optional reference**: same model, different runtime |

Three folders prove **portability of one model**. They are **not** three services to operate in production.

### Not over-engineering

*“Will every simple feature be built in three languages with a week of docs?”* **No.**

| Question | Answer |
| --- | --- |
| Day-to-day delivery? | **One stack**, smallest correct change, tests at real boundaries. |
| Why three codebases here? | Take-home + rubric + portability proof for **this submission only**. |
| Why this much documentation? | Reviewer time-boxing and **explicit non-goals**, not README on every ticket. |
| What was omitted? | Database, queues, web framework, event sourcing, external services: [ADR 001](decisions/001-no-database-or-event-sourcing.md). |

## Professional summary

| | |
| --- | --- |
| **Experience** | ~20 years commercial software; ~8 years Principal Engineer at Xero (payments platform) |
| **Primary stacks** | C# / .NET (2009–present), TypeScript / Node.js (2018–present) |
| **DDD** | Eric Evans, Vaughn Vernon; event storming at Xero |
| **This repo** | One portable domain model in three runtimes; payments-aware batch design, not a production bank |

## Polyglot delivery

| Priority | Implementation | Review focus |
| --- | --- | --- |
| **1** | [`dotnet/`](../dotnet/) | Primary professional stack |
| **2** | [`nodejs-typescript/`](../nodejs-typescript/) | TypeScript reference |
| **3** | [`ruby/`](../ruby/) | RSpec rubric |

Details: [architecture/polyglot-comparison.md](architecture/polyglot-comparison.md). Recruitment guidance: use your strongest language: review order is **.NET → TypeScript → Ruby**.

## Language background

| Stack | Timeline | Notes |
| --- | --- | --- |
| **Ruby & Perl** | First role (Multi Service, 2004–2008) | Foundation; ongoing interest in Ruby |
| **C# / .NET** | Synchronised Software 2009 → present | Primary commercial stack |
| **TypeScript** | 2018 → present | Strong platform fit |
| **Ruby (commercial)** | Limited in recent years | This exercise + rubric; not day-to-day vs .NET/TS |

## Xero: Principal Engineer (Jul 2018 – Mar 2026)

| Period | Focus |
| --- | --- |
| May 2025 – Mar 2026 | Payments platform; Making Payments |
| Jul 2023 – May 2025 | Collecting Payments, Making Payments |
| Mar 2022 – Mar 2023 | Making Payments, Inflow Lending |
| Sep 2019 – Aug 2022 | Payments and inflow lending |
| Jul 2018 – Sep 2019 | Senior developer; payments (e.g. TransferWise) |

## What this submission demonstrates

| Capability | Evidence |
| --- | --- |
| Payments batch semantics | Evaluate-before-apply; `TransferResult`; reconciliation |
| Tactical DDD | [domain-model.md](domain/domain-model.md) |
| Scoped judgement | [decisions/](decisions/README.md); in-process optional features only |
| Polyglot portability | Three aligned codebases; [polyglot-comparison.md](architecture/polyglot-comparison.md) |
| Production awareness | Evolution in [production-roadmap.md](architecture/production-roadmap.md) |

## Read next

1. [Reviewer guide](reviewer-guide.md): run each stack (~2 min each)
2. [Documentation index](README.md): full map
3. [Challenge rubric](challenge-rubric.md): RSpec evidence in `ruby/`
