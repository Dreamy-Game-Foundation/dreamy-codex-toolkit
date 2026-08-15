#!/usr/bin/env bash
set -euo pipefail

tmp="$(mktemp -d)"
mkdir -p "$tmp/Packages"
cat > "$tmp/Packages/manifest.json" <<'JSON'
{
  "dependencies": {
    "com.dreamy.core": "1.1.2",
    "com.dreamy.ui": "0.1.1"
  }
}
JSON
cat > "$tmp/AGENTS.md" <<'EOF'
# User Instructions

Keep this text.
EOF

before="$(sha256sum "$tmp/AGENTS.md" | awk '{print $1}')"
src/cli install --target "$tmp" --preset dreamy-project >/tmp/dreamy-install.out
test -f "$tmp/.dreamy-codex/project-profile.json"
test -f "$tmp/.dreamy-codex/install-state.json"
grep -q 'DREAMY-CODEX:START' "$tmp/AGENTS.md"
grep -q 'Keep this text.' "$tmp/AGENTS.md"

src/cli uninstall --target "$tmp" >/tmp/dreamy-uninstall.out
if grep -q 'DREAMY-CODEX:START' "$tmp/AGENTS.md"; then
  echo "managed block remained after uninstall"
  exit 1
fi
grep -q 'Keep this text.' "$tmp/AGENTS.md"
after="$(sha256sum "$tmp/AGENTS.md" | awk '{print $1}')"
test "$before" = "$after"

if src/cli install --target "$tmp" --preset typo >/tmp/dreamy-bad-preset.out 2>/tmp/dreamy-bad-preset.err; then
  echo "invalid preset unexpectedly installed"
  exit 1
fi

tmp_existing="$(mktemp -d)"
cat > "$tmp_existing/AGENTS.md" <<'EOF'
<!-- DREAMY-CODEX:START schema=1 -->
unowned
<!-- DREAMY-CODEX:END -->
EOF
src/cli install --target "$tmp_existing" >/tmp/dreamy-partial.out
test -e "$tmp_existing/.dreamy-codex/project-profile.json"
grep -q 'Dreamy Codex Toolkit' "$tmp_existing/AGENTS.md"

src/cli uninstall --target "$tmp_existing" >/tmp/dreamy-adopted-uninstall.out
if grep -q 'DREAMY-CODEX:START' "$tmp_existing/AGENTS.md"; then
  echo "adopted managed block remained after uninstall"
  exit 1
fi

tmp_unowned="$(mktemp -d)"
cat > "$tmp_unowned/AGENTS.md" <<'EOF'
<!-- DREAMY-CODEX:START schema=1 -->
unowned
<!-- DREAMY-CODEX:END -->
EOF
if src/cli uninstall --target "$tmp_unowned" >/tmp/dreamy-unowned.out 2>/tmp/dreamy-unowned.err; then
  echo "unowned managed block unexpectedly removed"
  exit 1
fi
grep -q 'unowned' "$tmp_unowned/AGENTS.md"

tmp_malformed="$(mktemp -d)"
mkdir -p "$tmp_malformed/.dreamy-codex"
cat > "$tmp_malformed/AGENTS.md" <<'EOF'
before
<!-- DREAMY-CODEX:START schema=1 -->
missing end marker
after
EOF
jq -n --arg after "$(sha256sum "$tmp_malformed/AGENTS.md" | awk '{print $1}')" '{schemaVersion:1, checksums:{after:$after}}' > "$tmp_malformed/.dreamy-codex/install-state.json"
if src/cli uninstall --target "$tmp_malformed" >/tmp/dreamy-malformed.out 2>/tmp/dreamy-malformed.err; then
  echo "malformed managed block unexpectedly removed"
  exit 1
fi
grep -q 'after' "$tmp_malformed/AGENTS.md"

tmp_profile="$(mktemp -d)"
mkdir -p "$tmp_profile/Packages"
cat > "$tmp_profile/Packages/manifest.json" <<'JSON'
{"dependencies":{"com.dreamy.core":"1.1.2"}}
JSON
src/cli detect --target "$tmp_profile" --json > /tmp/dreamy-profile.json
jq -e '.packages | type == "array" and .[0].name == "com.dreamy.core"' /tmp/dreamy-profile.json >/dev/null

echo "Installer lifecycle passed"
