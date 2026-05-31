# Reviewer guide

Fast verification for the Mable Bank submission. Allow **~2–5 minutes per stack**.

This guide is the practical entry point: commands to run each stack, expected output, and how to try your own CSV files. Read [How the solution works](README.md#how-the-solution-works) first if you want the reasoning behind the design. Come here when you are ready to run code.

**Context:** [How this was built](README.md#how-this-was-built) · [Author profile](author-profile.md) · **Review order:** [`dotnet/`](../dotnet/) → [`nodejs-typescript/`](../nodejs-typescript/) → [`ruby/`](../ruby/) (RSpec rubric).

## Terminal commands (local SDK)

Run from the **implementation folder** with the SDK installed locally (no Docker).

| Stack | Folder | Run the solution |
| --- | --- | --- |
| C# / .NET | `dotnet/` | `./demo.sh` |
| TypeScript | `nodejs-typescript/` | `./demo.sh` |
| Ruby | `ruby/` | `./demo.sh` |

**TypeScript only**: full CI-style check (format, lint, coverage): `npm run verify`.

### C# / .NET: `dotnet/`

`./demo.sh` runs restore, build, test, and the fixture CLI.

```bash
cd dotnet
./demo.sh
```

### TypeScript: `nodejs-typescript/`

`./demo.sh` runs `npm ci`, test, build, and fixture CLI (`npm run demo`).

```bash
cd nodejs-typescript
./demo.sh
```

### Ruby: `ruby/`

`./demo.sh` runs `bundle install`, RSpec, RuboCop (if available), and the fixture CLI.

```bash
cd ruby
./demo.sh
```

## Terminal commands (Docker / Dev Container)

Run **`./demo.sh` inside the Dev Container image** without opening an IDE. Requires **Docker**.

| Stack | Folder | Command |
| --- | --- | --- |
| C# / .NET | `dotnet/` | `./script/test-devcontainer.sh` |
| TypeScript | `nodejs-typescript/` | `./script/test-devcontainer.sh` |
| Ruby | `ruby/` | `./script/test-devcontainer.sh` |

**From repo root (Git Bash / WSL / Linux / macOS):**

```bash
(cd dotnet && ./script/test-devcontainer.sh)
(cd nodejs-typescript && ./script/test-devcontainer.sh)
(cd ruby && ./script/test-devcontainer.sh)
```

**Windows PowerShell** (Docker only: no local .NET / Node / Ruby SDK):

```powershell
cd dotnet; ./script/test-devcontainer.ps1
cd nodejs-typescript; ./script/test-devcontainer.ps1
cd ruby; ./script/test-devcontainer.ps1
```

Inside a Dev Container started from an IDE, run `./demo.sh` in the implementation folder (SDKs are already installed), or run the CLI commands in [Run the CLI with your own CSV files](#run-the-cli-with-your-own-csv-files) below.

## Run the CLI with your own CSV files

Use any pair of CSV files that match the expected format. Paths are **relative to the implementation folder** (or absolute).

### CSV format

**Account balances** (`<balances>.csv`):

```csv
Account,Balance
1111234522226789,5000.00
1111234522221234,10000.00
```

| Column | Rule |
| --- | --- |
| `Account` | Exactly **16 digits** (leading zeros preserved) |
| `Balance` | Non-negative decimal, at most **2** decimal places |

**Transactions** (`<transactions>.csv`):

```csv
From,To,Amount
1111234522226789,1212343433335665,500.00
1111234522221234,1212343433335665,25.60
```

| Column | Rule |
| --- | --- |
| `From` / `To` | 16-digit account numbers (must exist in balances file) |
| `Amount` | Positive decimal, at most **2** decimal places |

Optional column (all stacks, [ADR 007](decisions/007-in-memory-idempotency-and-journal.md)): `TransferId` on the transactions file for idempotency within a run.

First row is a **header**; data rows follow.

### Bundled example fixtures

| Stack | Balances | Transactions |
| --- | --- | --- |
| C# / .NET | `tests/MableBank.Tests/Fixtures/mable_account_balances.csv` | `tests/MableBank.Tests/Fixtures/mable_transactions.csv` |
| TypeScript | `test/fixtures/mable_account_balances.csv` | `test/fixtures/mable_transactions.csv` |
| Ruby | `spec/fixtures/mable_account_balances.csv` | `spec/fixtures/mable_transactions.csv` |

Copy your own files into the implementation folder (e.g. `data/my_balances.csv`) and pass those paths to the CLI.

### CLI usage (all stacks)

```text
<command> [--dry-run] <account_balances.csv> <transactions.csv>
```

`--dry-run` simulates transfers without mutating balances (where supported).

Replace `<balances.csv>` and `<transactions.csv>` with your file paths.

---

### C# / .NET: `dotnet/`

**Syntax:** `dotnet run --project src/MableBank.Cli -- [--dry-run] <balances.csv> <transactions.csv>`

**Local terminal** (after `dotnet build`):

```bash
cd dotnet
dotnet run --project src/MableBank.Cli -- \
  tests/MableBank.Tests/Fixtures/mable_account_balances.csv \
  tests/MableBank.Tests/Fixtures/mable_transactions.csv
```

**Your own CSV files:**

```bash
dotnet run --project src/MableBank.Cli -- data/my_balances.csv data/my_transactions.csv
dotnet run --project src/MableBank.Cli -- --dry-run data/my_balances.csv data/my_transactions.csv
```

**Dev Container** (Rider, VS Code, or `./script/test-devcontainer.sh`):

1. Open folder `dotnet/` in the container.
2. Terminal:

```bash
dotnet run --project src/MableBank.Cli -- \
  tests/MableBank.Tests/Fixtures/mable_account_balances.csv \
  tests/MableBank.Tests/Fixtures/mable_transactions.csv
```

**Rider:** Run → Edit Configurations → .NET Executable → project `MableBank.Cli` → program arguments: `tests/MableBank.Tests/Fixtures/mable_account_balances.csv tests/MableBank.Tests/Fixtures/mable_transactions.csv` (optional: `--dry-run` first).

---

### TypeScript: `nodejs-typescript/`

**Syntax:** `npm start -- [--dry-run] <balances.csv> <transactions.csv>` (dev, via tsx)  
or `node dist/bin/mable-bank.js …` (after `npm run build`).

**Local terminal:**

```bash
cd nodejs-typescript
npm start -- test/fixtures/mable_account_balances.csv test/fixtures/mable_transactions.csv
```

**Your own CSV files:**

```bash
npm start -- data/my_balances.csv data/my_transactions.csv
npm start -- --dry-run data/my_balances.csv data/my_transactions.csv
```

After build:

```bash
npm run build
node dist/bin/mable-bank.js data/my_balances.csv data/my_transactions.csv
```

**Dev Container** (WebStorm, VS Code, or `./script/test-devcontainer.sh`):

1. Open folder `nodejs-typescript/` in the container.
2. Terminal:

```bash
npm start -- test/fixtures/mable_account_balances.csv test/fixtures/mable_transactions.csv
```

**WebStorm:** npm script `start` with extra args, or a Node run configuration on `bin/mable-bank.ts` with program arguments: `test/fixtures/mable_account_balances.csv test/fixtures/mable_transactions.csv`.

---

### Ruby: `ruby/`

**Syntax:** `ruby bin/mable_bank [--dry-run] <balances.csv> <transactions.csv>`

**Local terminal:**

```bash
cd ruby
ruby bin/mable_bank spec/fixtures/mable_account_balances.csv spec/fixtures/mable_transactions.csv
```

**Your own CSV files:**

```bash
ruby bin/mable_bank data/my_balances.csv data/my_transactions.csv
ruby bin/mable_bank --dry-run data/my_balances.csv data/my_transactions.csv
```

**Dev Container** (RubyMine, VS Code, or `./script/test-devcontainer.sh`):

1. Open folder `ruby/` in the container.
2. Terminal:

```bash
ruby bin/mable_bank spec/fixtures/mable_account_balances.csv spec/fixtures/mable_transactions.csv
```

**RubyMine:** Run → Edit Configurations → Ruby → script `bin/mable_bank` → parameters: `spec/fixtures/mable_account_balances.csv spec/fixtures/mable_transactions.csv`.

---

### Quick reference: IDE + Dev Container

| Stack | Open folder | IDE | Tests + build + fixture demo | CLI only (custom CSV) |
| --- | --- | --- | --- | --- |
| .NET | `dotnet/` | Rider | `./demo.sh` | `dotnet run --project src/MableBank.Cli -- <balances> <transactions>` |
| TypeScript | `nodejs-typescript/` | WebStorm | `./demo.sh` | `npm start -- <balances> <transactions>` |
| Ruby | `ruby/` | RubyMine | `./demo.sh` | `ruby bin/mable_bank <balances> <transactions>` |
| Any | same | VS Code | Dev Containers → Reopen in Container → `./demo.sh` | Same CLI column as above |

**Docker without IDE:** `./script/test-devcontainer.sh` runs `./demo.sh` (bundled fixtures). To test **your** CSVs in Docker, start a shell in the container (or use `docker run` with a volume mount) and run the CLI command for that stack.

## Expected outcome

Example fixtures produce **4** successful transfers. Key balance: **`1111234522226789: 4820.50`**. Full set:

```text
1111234522221234: 9974.40
1111234522226789: 4820.50
1212343433335665: 1725.60
2222123433331212: 1550.00
3212343433335755: 48679.50
```

## 1. C# / .NET (review first)

**Environment:** .NET 9 SDK (`global.json`). Local or Rider Dev Container on `dotnet/`.

```bash
cd dotnet
./demo.sh
```

Docker (no IDE): `./script/test-devcontainer.sh`

More: [dotnet/README.md](../dotnet/README.md).

## 2. TypeScript / Node.js

**Environment:** Node.js 22+. Local or WebStorm Dev Container on `nodejs-typescript/`.

```bash
cd nodejs-typescript
./demo.sh
```

Optional full CI: `npm run verify`. Docker: `./script/test-devcontainer.sh`

More: [nodejs-typescript/README.md](../nodejs-typescript/README.md).

## 3. Ruby (RSpec rubric)

**Environment:** Ruby 3.3. Local or RubyMine Dev Container on `ruby/`.

```bash
cd ruby
./demo.sh
```

Docker: `./script/test-devcontainer.sh`

Rubric: [challenge-rubric.md](challenge-rubric.md) · [ruby/README.md](../ruby/README.md).

## Development environment and IDEs

**Full walkthrough (plain English):** [devcontainers.md](devcontainers.md): VS Code, Rider, WebStorm, RubyMine, smoke tests without an IDE, Windows troubleshooting.

Summary below. Containers are for **development and review only**, not production. No Docker Compose, database, or external services.

### Prerequisites

- Docker installed and running
- **Open the implementation folder** (`dotnet/`, `nodejs-typescript/`, or `ruby/`), not only the repository root

### JetBrains (author workflow)

| Implementation | Folder | IDE | Run in container terminal |
| --- | --- | --- | --- |
| C# / .NET | `dotnet/` | **Rider** | `./demo.sh` |
| TypeScript | `nodejs-typescript/` | **WebStorm** | `./demo.sh` |
| Ruby | `ruby/` | **RubyMine** | `./demo.sh` |

**Rider (`dotnet/`)**: Open `dotnet/` → Dev Container → terminal:
- `./demo.sh` (tests + fixture CLI)
- Custom CSV: see [.NET CLI](#c--net--dotnet) above.

**WebStorm (`nodejs-typescript/`)**: Open `nodejs-typescript/` → Dev Container → terminal:
- `./demo.sh` or `npm run verify` (full CI)
- Custom CSV: see [TypeScript CLI](#typescript--nodejs-typescript) above.

**RubyMine (`ruby/`)**: Open `ruby/` → Dev Container → terminal:
- `./demo.sh`
- Custom CSV: see [Ruby CLI](#ruby--ruby) above.

If a container fails to start, rebuild from the JetBrains Dev Containers UI or recent Dev Containers on the welcome screen.

### VS Code

1. **File → Open Folder** → choose `dotnet/`, `nodejs-typescript/`, or `ruby/` (not the repo root).
2. **Dev Containers: Reopen in Container** when prompted.
3. Integrated terminal:
   - Full check: `./demo.sh`
   - Custom CSV: use the CLI command for that stack in [Run the CLI with your own CSV files](#run-the-cli-with-your-own-csv-files).

### Dev Container runtime

| Stack | Runtime | Post-create |
| --- | --- | --- |
| `dotnet/` | .NET 9 (SDK 9.0.300 in `global.json`) | `dotnet restore` |
| `nodejs-typescript/` | Node.js **22** (see Dockerfile if Node 24 unavailable) | `npm ci` |
| `ruby/` | Ruby 3.3 | `bundle install` |

Terminal Docker smoke-test: `./script/test-devcontainer.sh` in each implementation folder.

## Decision records

| ADR | Topic |
| --- | --- |
| [001](decisions/001-no-database-or-event-sourcing.md) | No database in scope |
| [002](decisions/002-company-account-book-aggregate.md) | Aggregate boundary |
| [003](decisions/003-business-failures-as-results.md) | Results vs exceptions |
| [004](decisions/004-synchronous-sequential-execution.md) | Sync sequential batch |
| [005](decisions/005-observability-ports.md) | Observability ports |
| [006](decisions/006-checkpoint-and-replay-sketch.md) | Checkpoint sketch |
| [007](decisions/007-in-memory-idempotency-and-journal.md) | Idempotency + journal |

## FAQ

| Question | Answer |
| --- | --- |
| Why three implementations? | One model: .NET take-home, Ruby RSpec rubric, TS reference: [author-profile](author-profile.md#how-this-was-developed) |
| Triple every feature in prod? | **No.** One stack per deliverable; three folders are for this submission only |
| Transfer fails mid-file? | Later rows still process |
| Duplicate transfer id in one run? | Skipped (`already_processed`, ADR 007) |
| Dry-run? | `--dry-run` before the two CSV paths (all stacks) |
| Custom CSV files? | [Run the CLI with your own CSV files](#run-the-cli-with-your-own-csv-files) |
| Rubric folder? | `ruby/` (RSpec). Depth: `dotnet/` |
