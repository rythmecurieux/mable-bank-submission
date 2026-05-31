$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$image = "mable-bank-typescript-devcontainer:test"
$workspace = Split-Path -Leaf $root

# Host npm installs can leave node_modules the container user cannot replace.
Remove-Item -Path (Join-Path $root "node_modules") -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Building Dev Container image..."
docker build -f "$root/.devcontainer/Dockerfile" -t $image "$root/.devcontainer"
if ($LASTEXITCODE -ne 0) { throw "Docker build failed (exit $LASTEXITCODE)." }

Write-Host "Running demo.sh in container..."
docker run --rm `
  -v "${root}:/workspaces/${workspace}:rw" `
  -w "/workspaces/${workspace}" `
  $image `
  bash -lc "sudo chown -R node:node . 2>/dev/null || true && sudo -u node bash -lc './demo.sh'"

if ($LASTEXITCODE -ne 0) {
  throw "Dev Container smoke test failed (exit $LASTEXITCODE)."
}

Write-Host "Dev Container smoke test passed."
