#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"

# Git Bash on Windows rewrites /workspaces/* to C:/Program Files/Git/workspaces/* unless disabled.
export MSYS_NO_PATHCONV=1
export MSYS2_ARG_CONV_EXCL='*'

docker run --rm \
  -v "${root}:/workspaces/ruby:rw" \
  -w /workspaces/ruby \
  mcr.microsoft.com/devcontainers/ruby:1-3.3-bookworm \
  bash -lc "gem update --system && gem install bundler && ./demo.sh"

echo "Dev Container smoke test passed."
