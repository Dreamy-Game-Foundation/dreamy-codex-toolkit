#!/usr/bin/env bash
set -euo pipefail

scripts/check-unity-safety tests/fixtures/unity/asmdef-graph.safe.json

if scripts/check-unity-safety tests/fixtures/unity/asmdef-graph.unsafe.json >/tmp/dreamy-w2-unsafe.out 2>/tmp/dreamy-w2-unsafe.err; then
  echo "unsafe asmdef fixture unexpectedly passed"
  exit 1
fi

if scripts/check-unity-safety tests/fixtures/unity/asmdef-graph.guid-unsafe.json >/tmp/dreamy-w2-guid-unsafe.out 2>/tmp/dreamy-w2-guid-unsafe.err; then
  echo "GUID unsafe asmdef fixture unexpectedly passed"
  exit 1
fi

echo "Unity asmdef safety negative fixture failed as expected"
