$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

docker run --rm `
  -v "${root}:/workspaces/ruby:rw" `
  -w /workspaces/ruby `
  mcr.microsoft.com/devcontainers/ruby:1-3.3-bookworm `
  bash -lc "gem update --system && gem install bundler && ./demo.sh"

if ($LASTEXITCODE -ne 0) {
  throw "Dev Container smoke test failed (exit $LASTEXITCODE)."
}

Write-Host "Dev Container smoke test passed."
