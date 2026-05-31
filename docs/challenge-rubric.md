# Challenge rubric

Mapping of the published rubric to the **Ruby** solution under `ruby/`.

The author’s **primary implementations** are [`dotnet/`](../dotnet/) and [`nodejs-typescript/`](../nodejs-typescript/). This document exists because the rubric lists **RSpec**; evidence is in `ruby/spec/`. See [author-profile.md](author-profile.md) and [reviewer-guide.md](reviewer-guide.md).

## Summary

| Status | Count |
| --- | --- |
| Met | 14 |
| Partially met | 0 |
| Gap | 0 |

## Rubric table

| Rubric item | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Uses domain models | **Met** | `CompanyAccountBook`, `Account`, `Money`, `TransferInstruction`, `TransferResult` | `lib/mable_bank/domain/` |
| Uses native data structures readably | **Met** | Hashes for account index; arrays only at boundaries | No opaque metaprogramming |
| Uses RSpec | **Met** | `spec/` (95+ examples) | Layer-organised specs |
| Has some coverage | **Met** | SimpleCov ≥90% | Local run ~99% line coverage |
| Has good coverage | **Met** | Domain, application, infrastructure, CLI | Property-style invariant spec |
| Tests are orthogonal | **Met** | Separate examples per behaviour | One concern per example where practical |
| Tests explain the functionality | **Met** | Descriptive `it` strings; fixture golden balances | |
| Models encapsulate logic appropriately | **Met** | Rules in domain; CSV in infrastructure | |
| Respects separation of concerns | **Met** | Domain / application / infrastructure / CLI | [solution-design.md](architecture/solution-design.md) |
| Short methods | **Met** | RuboCop `Metrics/MethodLength` Max 20 | |
| Readable methods | **Met** | Named collaborators; minimal nesting | |
| Runs and provides feedback | **Met** | `bin/mable_bank`, exit codes, failure sections | CLI + CI workflow |
| Calculates test files accurately | **Met** | Fixture example: all five final balances match | `process_day_spec`, `process_transfers_spec`, `cli_spec` |

## Business rules: test evidence

| Rule | Spec location |
| --- | --- |
| Valid / invalid money | `spec/domain/money_spec.rb` |
| Money add / subtract / compare / format | `spec/domain/money_spec.rb`, `money_formatter_spec.rb` |
| Valid / invalid 16-digit account numbers | `spec/domain/account_number_spec.rb` |
| Account credit and debit | `spec/domain/account_spec.rb` |
| Overdraft rejection | `spec/domain/account_spec.rb`, `company_account_book_spec.rb` |
| Balance unchanged after failed debit | `spec/domain/account_spec.rb`, `company_account_book_spec.rb` |
| Successful transfer | `spec/domain/company_account_book_spec.rb` |
| Insufficient funds rejection | `spec/domain/company_account_book_spec.rb` |
| Missing source / destination | `spec/domain/company_account_book_spec.rb` |
| Failed transfer: no partial mutation | `spec/domain/company_account_book_spec.rb`, `company_account_book_properties_spec.rb` |
| Deterministic final balances | `spec/domain/company_account_book_spec.rb`, `process_transfers_spec.rb` |
| Positive transfer amount | `spec/domain/transfer_instruction_spec.rb` |
| CSV valid / invalid files | `spec/infrastructure/csv_*_spec.rb` |
| CLI with fixtures | `spec/cli_spec.rb` |

## Verification

```bash
cd ruby
bundle install
bundle exec rspec
bundle exec rubocop
ruby bin/mable_bank spec/fixtures/mable_account_balances.csv spec/fixtures/mable_transactions.csv
```

Dev Container: reopen the `ruby/` folder; see [../README.md](../README.md).
