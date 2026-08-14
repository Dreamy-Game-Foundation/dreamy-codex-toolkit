#!/usr/bin/env bash
set -e

echo "✨ Dreamy Codex Toolkit - Easy 1-Line Installer"
echo "=================================================="

if ! command -v node >/dev/null 2>&1; then
    echo "❌ Error: Node.js is not installed. Please install Node.js (>=20) from https://nodejs.org/"
    exit 1
fi

TARGET="${1:-.}"
PRESET="${2:-dreamy-project}"

echo "🚀 Installing Dreamy Codex Toolkit (Target: $TARGET, Preset: $PRESET)..."
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main install --target "$TARGET" --preset "$PRESET"

echo ""
echo "✅ Installation finished successfully!"
echo "📄 Diagnostic health check:"
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main doctor --target "$TARGET"
