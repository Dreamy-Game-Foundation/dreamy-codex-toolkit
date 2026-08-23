param (
    [string]$Target = ".",
    [string]$Preset = "dreamy-project"
)

$ErrorActionPreference = "Stop"

Write-Host "✨ Dreamy Codex Toolkit - Easy 1-Line Installer" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "❌ Error: Node.js is not installed. Please install Node.js (>=20) from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Installing Dreamy Codex Toolkit (Target: $Target, Preset: $Preset)..." -ForegroundColor Green
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main install --target "$Target" --preset "$Preset"
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
