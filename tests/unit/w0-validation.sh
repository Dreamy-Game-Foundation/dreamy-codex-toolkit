#!/usr/bin/env bash
set -euo pipefail

scripts/validate

jq -e '.packages["com.dreamy.dataconfig"].drift[] | select(test("UniTask"))' compatibility/dreamy-packages.json >/dev/null
jq -e '.packages["com.dreamy.ui"].drift[] | select(test("TextMeshPro"))' compatibility/dreamy-packages.json >/dev/null
jq -e '.packages["com.dreamy.editor-tools"].unsupportedContracts[] | select(test("headless"))' compatibility/dreamy-packages.json >/dev/null

echo "W0 drift checks passed"
