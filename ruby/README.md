# Mable Bank: Ruby (challenge rubric)

Ruby implementation for the **coding challenge rubric** (RSpec). The author’s **primary professional stacks** are [`../dotnet/`](../dotnet/) and [`../nodejs-typescript/`](../nodejs-typescript/). See [../docs/author-profile.md](../docs/author-profile.md).

**Ruby background:** Ruby and Perl from first role (Multi Service); ongoing interest in Ruby given industry direction. Recent **commercial** delivery has been mainly .NET and TypeScript; this tree satisfies the **RSpec rubric** and applies that interest to the same domain model as `dotnet/` and `nodejs-typescript/`.

## Dev Container

This project includes a lightweight Dev Container for RubyMine, VS Code, and compatible tools.

The Dev Container is for repeatable development and review only. It is not production infrastructure.

Open the **`ruby/`** folder (not the repo root). Post-create: `bundle install`. IDE and Dev Container steps: [../docs/reviewer-guide.md#development-environment-and-ides](../docs/reviewer-guide.md#development-environment-and-ides).

## Run from terminal

```bash
./demo.sh
```

`demo.sh` runs `bundle install`, RSpec, RuboCop (if configured), and the fixture CLI.

### CLI with your own CSV files

```bash
ruby bin/mable_bank <balances.csv> <transactions.csv>
ruby bin/mable_bank --dry-run <balances.csv> <transactions.csv>
```

Example fixtures: `spec/fixtures/mable_account_balances.csv` and `mable_transactions.csv`.  
Full format, RubyMine/Dev Container/VS Code: [../docs/reviewer-guide.md#run-the-cli-with-your-own-csv-files](../docs/reviewer-guide.md#run-the-cli-with-your-own-csv-files) (Ruby section).

Dev Container smoke-test: `./script/test-devcontainer.sh`

Rubric mapping: [../docs/challenge-rubric.md](../docs/challenge-rubric.md)

1. Open RubyMine.
2. Open the `ruby/` folder.
3. Ensure Docker is running.
4. RubyMine should detect `.devcontainer/devcontainer.json`.
5. Choose to open/start the project in the Dev Container.
6. Once the container is ready, open the built-in terminal.
7. Run:

```bash
./demo.sh
```

8. Confirm the final balances match the expected output below.

If the Dev Container does not start, rebuild it from the JetBrains Dev Containers UI or from the recent Dev Containers area on the welcome screen.

## Features (ADR 007)

- TransferId, in-memory idempotency registry, transfer journal
- Architecture spec: `spec/architecture/layering_spec.rb`

## Limits

| Topic | Behaviour |
| --- | --- |
| **Execution** | Synchronous sequential batch ([ADR 004](../docs/decisions/004-synchronous-sequential-execution.md)) |
| **Persistence** | In-memory per run |
| **Re-runs** | Idempotent within a run; new CLI invocation starts fresh |

Full documentation: [../docs/README.md](../docs/README.md)

## Example output

```text
1111234522221234: 9974.40
1111234522226789: 4820.50
1212343433335665: 1725.60
2222123433331212: 1550.00
3212343433335755: 48679.50
```
