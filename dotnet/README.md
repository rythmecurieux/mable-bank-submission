# Mable Bank: C# / .NET (primary implementation)



**Review this folder first.** Principal-grade reference for the Mable Bank challenge. Documentation: [`../docs/`](../docs/). Start with [docs/README.md](../docs/README.md).



Same domain model as TypeScript and Ruby implementations; compiler-enforced layering, payments-aware batch semantics (ADR 007 idempotency and journal).



## Solution layout



```

dotnet/

  MableBank.sln

  demo.sh

  script/

    test-devcontainer.sh

  src/

    MableBank.Domain/

    MableBank.Application/

    MableBank.Infrastructure/

    MableBank.Cli/

  tests/

    MableBank.Tests/

    MableBank.Architecture.Tests/

```



## Stack



- C# 13, .NET 9 (`net9.0`), SDK pinned in `global.json`

- System.CommandLine 2.x, CsvHelper, IAsyncEnumerable pipeline

- TransferProcessedTelemetry (ADR 005)

- NetAnalyzers `AnalysisMode=All`, `TreatWarningsAsErrors`

- xUnit, FluentAssertions, FsCheck, NetArchTest, coverlet (90% line gate)



## Run the solution



```bash

cd dotnet

./demo.sh

```



`demo.sh` runs restore, build, tests, and the fixture CLI.

### CLI with your own CSV files

```bash
dotnet run --project src/MableBank.Cli -- <balances.csv> <transactions.csv>
dotnet run --project src/MableBank.Cli -- --dry-run <balances.csv> <transactions.csv>
```

Example fixtures: `tests/MableBank.Tests/Fixtures/mable_account_balances.csv` and `mable_transactions.csv`.  
Full format, Rider/Dev Container/VS Code: [../docs/reviewer-guide.md#run-the-cli-with-your-own-csv-files](../docs/reviewer-guide.md#run-the-cli-with-your-own-csv-files) (.NET section).

Dev Container smoke-test (Docker, no IDE): `./script/test-devcontainer.sh`



## Dev Container



Open the **`dotnet/`** folder (not the repo root). Post-create: `dotnet restore`. IDE steps: [../docs/reviewer-guide.md#development-environment-and-ides](../docs/reviewer-guide.md#development-environment-and-ides).



In Rider (or VS Code with Dev Containers): start the container, then:



```bash

./demo.sh

```



## Architecture rules (enforced in CI)



- Domain → Application → Infrastructure → Cli (no upward references)

- See `tests/MableBank.Architecture.Tests/`

