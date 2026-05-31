# ADR 003: Business transfer failures as TransferResult values

**Status:** Accepted  
**Date:** 2026-05-30

## Context

Batch files routinely contain transfers that will decline (insufficient funds, unknown account). Operators need a full report, not a halted process.

## Decision

`CompanyAccountBook#transfer` and `#simulate` return `TransferResult` with `:succeeded` or `:failed` and a `reason_code`. Infrastructure parse errors and duplicate balance rows remain exceptions rescued at the CLI (exit `1`).

`Account#debit!` still raises `InsufficientFundsError` if called without `can_debit?`; a programmer-error guard, not the primary control flow.

## Consequences

- **Positive:** `ProcessTransfers` collects outcomes and continues; reporter lists all failures.
- **Positive:** Exit code `0` when the run completes even if some transfers failed; distinguishes “job finished” from “job could not run”.
- **Negative:** Callers must handle both results and exceptions at boundaries.

## Alternatives considered

| Alternative | Rejected because |
| --- | --- |
| Raise on insufficient funds | Stops batch or forces rescue-per-row; poor fit for file processing |
| Silent skip on failure | No audit trail in output |
| Result type per failure (`InsufficientFundsResult`, …) | Unnecessary class proliferation for three codes |
