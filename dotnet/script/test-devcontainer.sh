#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"

# Git Bash on Windows rewrites /workspaces/* to C:/Program Files/Git/workspaces/* unless disabled.
export MSYS_NO_PATHCONV=1
export MSYS2_ARG_CONV_EXCL='*'

docker run --rm \
  -v "${root}:/workspaces/dotnet:rw" \
  -w /workspaces/dotnet \
  mcr.microsoft.com/devcontainers/dotnet:1-9.0-bookworm \
  bash -lc "find . -type d \\( -name bin -o -name obj \\) -print0 2>/dev/null | sort -z -r | xargs -0 -r rm -rf 2>/dev/null || true; ./demo.sh"

echo "Dev Container smoke test passed."
