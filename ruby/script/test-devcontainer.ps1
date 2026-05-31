$ErrorActionPreference = "Stop"
$rubyRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$repoRoot = (Resolve-Path (Join-Path $rubyRoot "..")).Path
$image = "mable-bank-ruby-devcontainer:test"

Write-Host "Building Dev Container image..."
docker build -f "$rubyRoot/.devcontainer/Dockerfile" -t $image $rubyRoot
if ($LASTEXITCODE -ne 0) { throw "Docker build failed (exit $LASTEXITCODE)." }

Write-Host "Running demo.sh in container..."
docker run --rm `
  -v "${repoRoot}:/workspaces/repo-root:rw" `
  -w /workspaces/repo-root/ruby `
  -e BUNDLE_PATH=/home/vscode/.gem-bundle `
  -e BUNDLE_IGNORE_CONFIG=1 `
  $image `
  bash -lc "./demo.sh"

if ($LASTEXITCODE -ne 0) {
  throw "Dev Container smoke test failed (exit $LASTEXITCODE)."
}

Write-Host "Dev Container smoke test passed."
