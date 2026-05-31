# Mable Bank: TypeScript reference

**TypeScript / Node.js reference**, second in review order after [`../dotnet/`](../dotnet/). Same domain model: rollback, dry-run, reconciliation, observability (ADR 005), idempotency and journal (ADR 007), RFC 4180 CSV, architecture layering tests. Docs: [`../docs/README.md`](../docs/README.md).

## Run locally

```bash
cd nodejs-typescript
./demo.sh
```

`demo.sh` runs `npm ci`, tests, build, and the fixture CLI.

Full CI-style check (format, lint, coverage): `npm run verify`.

### CLI with your own CSV files

```bash
npm start -- <balances.csv> <transactions.csv>
npm start -- --dry-run <balances.csv> <transactions.csv>
```

Example fixtures: `test/fixtures/mable_account_balances.csv` and `mable_transactions.csv`.  
Full format, WebStorm/Dev Container/VS Code: [../docs/reviewer-guide.md#run-the-cli-with-your-own-csv-files](../docs/reviewer-guide.md#run-the-cli-with-your-own-csv-files) (TypeScript section).

## Dev Container

This project includes a lightweight Dev Container for WebStorm, VS Code, and compatible tools.

The Dev Container is for repeatable development and review only. It is not production infrastructure.

Open the **`nodejs-typescript/`** folder (not the repo root). Post-create runs **`npm ci`**. IDE and Dev Container steps: [../docs/reviewer-guide.md#development-environment-and-ides](../docs/reviewer-guide.md#development-environment-and-ides).

Configuration: `.devcontainer/` (Node.js 22; TypeScript, Vitest, ESLint, Prettier; no database or external services).

## Run in WebStorm

1. Open WebStorm → open `nodejs-typescript/`.
2. Start the Dev Container when prompted.
3. In the terminal:

```bash
./demo.sh
```

Optional: `npm run verify` for format, lint, and coverage gates.

Dev Container smoke-test (Docker, no IDE): `./script/test-devcontainer.sh`

## Money: bigint minor units

`Money` stores amounts as **bigint cents** (minor units). Parsing rejects negatives and enforces at most two decimal places; arithmetic never uses floating-point dollars. `bigint` avoids `Number.MAX_SAFE_INTEGER` precision loss for large balances and aggregates.

Display uses `MoneyFormatter` / `format()` → exactly two decimal places. CSV remains the only parse boundary for production paths; `Money.fromCents()` exists for tests and internal edge cases.

This maps to Ruby’s `BigDecimal`-backed `Domain::Money`, with native JS integers chosen for 2026 Node ledger safety.

## Mapping to Ruby domain model

| TypeScript                             | Ruby                                           |
| -------------------------------------- | ---------------------------------------------- |
| `Money`                                | `Domain::Money`                                |
| `AccountNumber`                        | `Domain::AccountNumber`                        |
| `Account`                              | `Domain::Account`                              |
| `AccountBalance`                       | `Domain::AccountBalance`                       |
| `CompanyAccountBook`                   | `Domain::CompanyAccountBook`                   |
| `Ledger` / `NullLedger`                | `Application::Ledger` / `Domain::NullLedger`   |
| `Reconciliation`                       | `Domain::Reconciliation`                       |
| `TransferInstruction`                  | `Domain::TransferInstruction`                  |
| `TransferResult`                       | `Domain::TransferResult`                       |
| `RollingBackLedger`                    | `Application::RollingBackLedger`               |
| `LoadAccountBalances`                  | `Application::LoadAccountBalances`             |
| `ProcessTransfers`                     | `Application::ProcessTransfers`                |
| `ProcessDay`                           | `Application::ProcessDay`                      |
| `TransferResultRecorder`               | `Application::TransferResultRecorder`          |
| `ProcessingReport`                     | `Application::ProcessingReport`                |
| `NullLogger` / `RecordingLogger`       | `Application::NullLogger` / `RecordingLogger`  |
| `NullMetrics` / `RecordingMetrics`     | `Application::NullMetrics` / `RecordingMetrics` |
| `CsvAccountBalanceReader`              | `Infrastructure::CsvAccountBalanceReader`      |
| `CsvTransferInstructionReader`         | `Infrastructure::CsvTransferInstructionReader` |
| `InputFile` (`validateInputFile`)      | `Infrastructure::InputFile`                  |
| `MoneyFormatter`                       | `Infrastructure::MoneyFormatter`               |
| `formatReport`                         | `Infrastructure::ConsoleReporter`              |
| `cli.ts` / `bin/mable-bank.ts`         | `bin/mable_bank`                               |
| `CsvParseError`                        | (infrastructure parse errors, not domain)      |

## Expected final balances (fixture demo)

```text
1111234522221234: 9974.40
1111234522226789: 4820.50
1212343433335665: 1725.60
2222123433331212: 1550.00
3212343433335755: 48679.50
```

## Stack

- Node.js 22+ locally; Dev Container uses the Microsoft TypeScript Node image
- TypeScript 5.x (strict)
- Vitest (≥90% line coverage threshold), ESLint, Prettier, tsx
- No NestJS, Express, database, ORM, queues, or web API

## Production scope

Persistence and idempotency are documented under [`../docs/architecture/production-roadmap.md`](../docs/architecture/production-roadmap.md). Not implemented. **Observability ports** (logger/metrics) are implemented with null/recording adapters for tests and extension, matching Ruby.
