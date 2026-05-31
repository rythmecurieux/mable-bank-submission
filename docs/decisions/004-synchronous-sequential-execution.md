# ADR 004: Synchronous sequential execution (not async)

**Status:** Accepted  
**Date:** 2026-05-30

## Context

Reviewers may ask whether transfers are processed asynchronously, via a job queue, or with concurrent workers.

## Decision

All processing is **synchronous** and **single-threaded**:

1. `CSV.foreach` reads one row at a time on the calling thread.
2. `ProcessTransfers#process` applies or simulates one instruction before the next.
3. `RollingBackLedger#atomic` runs debit/credit inline; no background commit.
4. `TransferResultRecorder#record` is called inline after each transfer.

There is no `async`/`await`, no threads, no fiber scheduler, no message broker, and no event loop.

## What “streaming” means here

- **Streaming** = incremental I/O and incremental recording (do not load the full CSV or all success results into memory).
- **Not streaming** = parallel or non-blocking execution.

## Consequences

- **Positive:** Deterministic order matches file order; easy to test and audit.
- **Positive:** No locking or partition strategy required for this scope.
- **Negative:** Throughput is limited to one CPU thread; large files run wall-clock sequential.

## When to revisit

- Multiple workers process the same account book → need partitioning or per-account locking (still may be sync per partition).
- External IO (HTTP payment rail) with latency → async *calls* might appear inside a transfer adapter, but the batch orchestration model may stay sequential per company file.
