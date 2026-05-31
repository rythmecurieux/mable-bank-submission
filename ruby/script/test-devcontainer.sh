#!/usr/bin/env bash
set -euo pipefail
ruby_root="$(cd "$(dirname "$0")/.." && pwd)"
repo_root="$(cd "${ruby_root}/.." && pwd)"
image="mable-bank-ruby-devcontainer:test"

# Git Bash on Windows rewrites /workspaces/* to C:/Program Files/Git/workspaces/* unless disabled.
export MSYS_NO_PATHCONV=1
export MSYS2_ARG_CONV_EXCL='*'

echo "Building Dev Container image..."
docker build -f "${ruby_root}/.devcontainer/Dockerfile" -t "${image}" "${ruby_root}"

echo "Running demo.sh in container..."
docker run --rm \
  -v "${repo_root}:/workspaces/repo-root:rw" \
  -w /workspaces/repo-root/ruby \
  -e BUNDLE_PATH=/home/vscode/.gem-bundle \
  -e BUNDLE_IGNORE_CONFIG=1 \
  "${image}" \
  bash -lc "./demo.sh"

echo "Dev Container smoke test passed."
