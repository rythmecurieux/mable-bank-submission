# Ubiquitous language

Shared vocabulary for the Mable Bank transfer-processing problem. Terms align across **C# / .NET** (primary), **TypeScript**, and **Ruby**. Ruby namespaces are shown as examples.

## Dictionary

| Term | Definition | Implementation | Notes |
| --- | --- | --- | --- |
| Company | Business customer whose accounts and daily transfers are processed | Conceptual | One company per run |
| Account | 16-digit account holding a monetary balance | `Domain::Account` | Entity within the aggregate |
| Account number | Validated 16-digit identifier | `Domain::AccountNumber` | Value object |
| Balance | Current money held by an account | `Account#balance` | Mutable; snapshots via `AccountBalance` |
| Money | Monetary value with exact decimal arithmetic | `Domain::Money` | BigDecimal / cents / `decimal` per stack |
| Transfer id | Business idempotency key | `Domain::TransferId` | ADR 007 |
| Transfer instruction | Requested movement from one account to another | `Domain::TransferInstruction` | Includes `transfer_id` |
| Source account | Account being debited | `TransferInstruction#from_account_number` | |
| Destination account | Account being credited | `TransferInstruction#to_account_number` | |
| Transfer | Domain operation debiting one account and crediting another | `CompanyAccountBook#transfer` | Via `evaluate` + `apply` |
| Transfer result | Outcome of attempting a transfer | `Domain::TransferResult` | Success, failure, or skipped |
| Insufficient funds | Source lacks enough money | `reason_code: :insufficient_funds` | No mutation |
| Processing day | One batch of instructions for one day | `Application::ProcessDay` | Application use case |
| Company account book | Aggregate root owning accounts and transfers | `Domain::CompanyAccountBook` | Aggregate root |
| CSV balance file | Input file with starting balances | `CsvAccountBalanceReader` | `Account,Balance` headers |
| CSV transfer file | Input file with requested transfers | `CsvTransferInstructionReader` | `From,To,Amount` headers |
| Final balance report | Output after all transfers | `ConsoleReporter` + `ProcessingReport` | |

## Terms not explicitly modelled

| Term | Status |
| --- | --- |
| Company | Conceptual; single implicit tenant per CLI run |
| OpeningBalancesLoaded / domain events | Conceptual; see [domain-model.md](domain-model.md) |
