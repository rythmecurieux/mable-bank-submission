#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
image="mable-bank-typescript-devcontainer:test"
workspace="$(basename "$root")"

# Git Bash on Windows rewrites /workspaces/* to C:/Program Files/Git/workspaces/* unless disabled.
export MSYS_NO_PATHCONV=1
export MSYS2_ARG_CONV_EXCL='*'

echo "Building Dev Container image..."
docker build -f "${root}/.devcontainer/Dockerfile" -t "${image}" "${root}/.devcontainer"

echo "Running demo.sh in container..."
docker run --rm \
  -v "${root}:/workspaces/${workspace}:rw" \
  -w "/workspaces/${workspace}" \
  "${image}" \
  bash -lc "rm -rf node_modules 2>/dev/null || true; sudo chown -R node:node . 2>/dev/null || true && sudo -u node bash -lc './demo.sh'"

echo "Dev Container smoke test passed."
