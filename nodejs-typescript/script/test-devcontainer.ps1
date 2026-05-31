$ErrorActionPreference = "Stop"
$tsRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$repoRoot = (Resolve-Path (Join-Path $tsRoot "..")).Path
$image = "mable-bank-typescript-devcontainer:test"

# Host npm installs can leave node_modules the container user cannot replace.
Remove-Item -Path (Join-Path $tsRoot "node_modules") -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Building Dev Container image..."
docker build -f "$tsRoot/.devcontainer/Dockerfile" -t $image $tsRoot
if ($LASTEXITCODE -ne 0) { throw "Docker build failed (exit $LASTEXITCODE)." }

Write-Host "Running demo.sh in container..."
docker run --rm `
  -v "${repoRoot}:/workspaces/repo-root:rw" `
  -w /workspaces/repo-root/nodejs-typescript `
  $image `
  bash -lc "sudo chown -R node:node . 2>/dev/null || true && sudo -u node bash -lc './demo.sh'"

if ($LASTEXITCODE -ne 0) {
  throw "Dev Container smoke test failed (exit $LASTEXITCODE)."
}

Write-Host "Dev Container smoke test passed."
