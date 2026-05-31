# ADR 002: CompanyAccountBook as the transfer aggregate

**Status:** Accepted  
**Date:** 2026-05-30

## Context

A transfer debits one account and credits another. Invariants: no negative source balance after a successful transfer; missing accounts must not partially update the book.

## Decision

`CompanyAccountBook` is the aggregate root. `Account` owns debit/credit mechanics; the book coordinates a transfer as one operation via `evaluate` then `apply`.

External code receives `AccountBalance` snapshots, not mutable `Account` instances. Accounts are copied on registration so callers cannot mutate balances outside `transfer`.

## Consequences

- **Positive:** One place enforces cross-account rules; failed `evaluate` never calls `apply`.
- **Positive:** `simulate` reuses `evaluate` for dry-run without duplicating checks.
- **Negative:** The book is in-memory only; persistence would wrap `apply` in a repository/transaction boundary later.

## Alternatives considered

| Alternative | Rejected because |
| --- | --- |
| Transfer service mutating two `Account` objects directly | Invariants scatter; easy to debit without paired credit |
| Event per transfer without aggregate | Overkill without an event consumer |
| Database as source of truth in this repo | Out of scope for daily CSV batch (see ADR 001) |
