# Mable Bank

Backend coding challenge: load company account balances from CSV, apply a day’s transfers, enforce non-negative balances.

This repo is a principal engineer submission for the Mable Bank take-home. It implements one transfer-processing model in three runtimes so reviewers can check behaviour quickly in their preferred stack. The documentation explains what the program does, why it is structured this way, and what was deliberately left out of scope.

**Documentation:** [docs/README.md](docs/README.md) → [How the solution works](docs/README.md#how-the-solution-works) → [How this was built](docs/README.md#how-this-was-built) → [Reviewer guide](docs/reviewer-guide.md) → [Author profile](docs/author-profile.md).

## What went into this repo

One **domain model** implemented three times for different review paths, not three products. In production you would ship one stack per feature. Here, three folders exist so the take-home, RSpec rubric, and portability proof can each be reviewed without re-reading the same logic in an unfamiliar language.

| Order | Folder | Why it exists | IDE (author) | Run the solution |
| --- | --- | --- | --- | --- |
| **1** | [`dotnet/`](dotnet/) | Primary take-home (~2–4 h scope) | Rider | `cd dotnet && ./demo.sh` |
| **2** | [`nodejs-typescript/`](nodejs-typescript/) | TypeScript reference, same fixtures | WebStorm | `cd nodejs-typescript && ./demo.sh` |
| **3** | [`ruby/`](ruby/) | RSpec rubric alignment | RubyMine | `cd ruby && ./demo.sh` |

Development was **domain-first**, then C# → Ruby → TypeScript, each in its own folder with a Dev Container for repeatable review. Deliberately **no** database, message bus, Docker Compose, or web API. See [docs/decisions/](docs/decisions/README.md).

Day to day: **one language per feature**. This repo is a **submission portfolio**, not a template to triple every ticket. Details: [docs/author-profile.md](docs/author-profile.md).

Background: Principal Engineer, Xero payments platform (~8 years). [docs/author-profile.md](docs/author-profile.md).

## Quick verify

Each stack: **`./demo.sh`** in its folder (restore/install, test, build, fixture CLI).

| Stack | Command |
| --- | --- |
| C# / .NET | `cd dotnet && ./demo.sh` |
| TypeScript | `cd nodejs-typescript && ./demo.sh` |
| Ruby | `cd ruby && ./demo.sh` |

TypeScript full CI (optional): `npm run verify` in `nodejs-typescript/`.

Docker Dev Container smoke-test (each folder): `./script/test-devcontainer.sh`

Command reference: [docs/reviewer-guide.md](docs/reviewer-guide.md).

Expected: **4** successful transfers; `1111234522226789: 4820.50`.

## Expected final balances

```text
1111234522221234: 9974.40
1111234522226789: 4820.50
1212343433335665: 1725.60
2222123433331212: 1550.00
3212343433335755: 48679.50
```

## Dev Containers and IDEs

Open the **implementation folder** (`dotnet/`, `nodejs-typescript/`, or `ruby/`), not the repo root. In the container terminal, run **`./demo.sh`**.

| Folder | JetBrains | Docker (terminal) |
| --- | --- | --- |
| `dotnet/` | Rider | `./script/test-devcontainer.sh` |
| `nodejs-typescript/` | WebStorm | `./script/test-devcontainer.sh` |
| `ruby/` | RubyMine | `./script/test-devcontainer.sh` |

Full steps: [docs/devcontainers.md](docs/devcontainers.md).

## Documentation

| Section | Entry |
| --- | --- |
| How the solution works | [docs/README.md#how-the-solution-works](docs/README.md#how-the-solution-works) |
| Build story | [docs/README.md#how-this-was-built](docs/README.md#how-this-was-built) |
| Run all stacks | [docs/reviewer-guide.md](docs/reviewer-guide.md) |
| Custom CSV + IDE/Dev Container CLI | [docs/reviewer-guide.md#run-the-cli-with-your-own-csv-files](docs/reviewer-guide.md#run-the-cli-with-your-own-csv-files) |
| Author & scope | [docs/author-profile.md](docs/author-profile.md) |
| Rubric (RSpec) | [docs/challenge-rubric.md](docs/challenge-rubric.md) |
| Polyglot mapping | [docs/architecture/polyglot-comparison.md](docs/architecture/polyglot-comparison.md) |
| Decisions | [docs/decisions/](docs/decisions/README.md) |

```text
mabel/
  docs/
  dotnet/               ← demo.sh
  nodejs-typescript/    ← demo.sh
  ruby/                 ← demo.sh
```
