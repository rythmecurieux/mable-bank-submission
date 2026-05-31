#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

bundle install
bundle exec rspec

if bundle exec rubocop --version >/dev/null 2>&1; then
  bundle exec rubocop
fi

ruby bin/mable_bank \
  spec/fixtures/mable_account_balances.csv \
  spec/fixtures/mable_transactions.csv
