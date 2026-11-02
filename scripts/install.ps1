param (
    [string]$Target = ".",
    [string]$Preset = "dreamy-project",
    [ValidateSet("off", "minimal", "standard", "strict")]
    [string]$Hooks = "off"
)

$ErrorActionPreference = "Stop"

Write-Host "✨ Dreamy Codex Toolkit - Easy 1-Line Installer" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "❌ Error: Node.js is not installed. Please install Node.js (>=20) from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

& node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 20 ? 0 : 1)"
if ($LASTEXITCODE -ne 0) { throw "Node.js >=20 required; upgrade from https://nodejs.org/" }

Write-Host "🚀 Installing Dreamy Codex Toolkit (Target: $Target, Preset: $Preset)..." -ForegroundColor Green
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main install --target "$Target" --preset "$Preset" --hooks "$Hooks"
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "✅ Installation finished successfully!" -ForegroundColor Green
Write-Host "📄 Diagnostic health check:" -ForegroundColor Yellow
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main doctor --target "$Target"
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
