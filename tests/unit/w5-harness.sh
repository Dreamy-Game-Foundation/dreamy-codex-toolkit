#!/usr/bin/env bash
set -euo pipefail

harness/dreamy-harness validate >/tmp/dreamy-harness.json
jq -e '.schemaVersion == 1 and .adapter == "dreamy-harness" and .operation == "validate" and .status == "pass" and .exitCode == 0' /tmp/dreamy-harness.json >/dev/null

if harness/dreamy-harness asmdef tests/fixtures/unity/asmdef-graph.guid-unsafe.json >/tmp/dreamy-harness-bad.json; then
  echo "unsafe harness fixture unexpectedly passed"
  exit 1
fi
jq -e '.status == "fail" and .exitCode == 1' /tmp/dreamy-harness-bad.json >/dev/null

if harness/dreamy-harness compile >/tmp/dreamy-harness-degraded.json; then
  echo "unsupported harness operation unexpectedly exited 0"
  exit 1
fi
jq -e '.status == "degraded" and .exitCode == 1 and .degradedReason' /tmp/dreamy-harness-degraded.json >/dev/null

echo "Harness evidence passed"
