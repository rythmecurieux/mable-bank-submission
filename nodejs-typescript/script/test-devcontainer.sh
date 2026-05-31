#!/usr/bin/env bash
set -euo pipefail
ts_root="$(cd "$(dirname "$0")/.." && pwd)"
repo_root="$(cd "${ts_root}/.." && pwd)"
image="mable-bank-typescript-devcontainer:test"

# Git Bash on Windows rewrites /workspaces/* to C:/Program Files/Git/workspaces/* unless disabled.
export MSYS_NO_PATHCONV=1
export MSYS2_ARG_CONV_EXCL='*'

rm -rf "${ts_root}/node_modules" 2>/dev/null || true

echo "Building Dev Container image..."
docker build -f "${ts_root}/.devcontainer/Dockerfile" -t "${image}" "${ts_root}"

echo "Running demo.sh in container..."
docker run --rm \
  -v "${repo_root}:/workspaces/repo-root:rw" \
  -w /workspaces/repo-root/nodejs-typescript \
  "${image}" \
  bash -lc "sudo chown -R node:node . 2>/dev/null || true && sudo -u node bash -lc './demo.sh'"

echo "Dev Container smoke test passed."
