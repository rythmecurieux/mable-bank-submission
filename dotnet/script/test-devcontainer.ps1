$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

# Host SDK builds leave bin/obj that Windows may lock; remove before bind-mounting into Linux.
Get-ChildItem -Path $root -Recurse -Directory -Include bin, obj -Force -ErrorAction SilentlyContinue |
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

docker run --rm `
  -v "${root}:/workspaces/dotnet:rw" `
  -w /workspaces/dotnet `
  mcr.microsoft.com/devcontainers/dotnet:1-9.0-bookworm `
  bash -lc "./demo.sh"

if ($LASTEXITCODE -ne 0) {
  throw "Dev Container smoke test failed (exit $LASTEXITCODE)."
}

Write-Host "Dev Container smoke test passed."
