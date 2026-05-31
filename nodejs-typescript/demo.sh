#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Host-created node_modules on bind mounts (common on Windows) can block the container user.
if [ -f /.dockerenv ] && [ -d node_modules ]; then
  rm -rf node_modules
fi

npm ci
npm test
npm run build
npm run demo
