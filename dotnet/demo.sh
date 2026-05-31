#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# bin/obj from a host SDK build (common on Windows bind mounts) can block container writes.
clean_build_artifacts() {
  if command -v dotnet >/dev/null 2>&1; then
    dotnet clean --verbosity quiet >/dev/null 2>&1 || true
  fi
  # Deepest-first so nested bin/obj under tests/ are removed before parents.
  find . -type d \( -name bin -o -name obj \) -print0 2>/dev/null \
    | sort -z -r \
    | xargs -0 -r rm -rf 2>/dev/null || true
}

clean_build_artifacts

dotnet restore
dotnet build
dotnet test
dotnet run --project src/MableBank.Cli --no-build -- \
  tests/MableBank.Tests/Fixtures/mable_account_balances.csv \
  tests/MableBank.Tests/Fixtures/mable_transactions.csv
