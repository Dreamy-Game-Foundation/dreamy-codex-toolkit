#!/usr/bin/env bash
set -euo pipefail

harness/dreamy-harness help >/tmp/dreamy-harness.json
jq -e '.schemaVersion == 1 and .adapter == "dreamy-harness" and .operation == "help" and .status == "pass" and .summary and .exitCode == 0' /tmp/dreamy-harness.json >/dev/null

if harness/dreamy-harness asmdef tests/fixtures/unity/asmdef-graph.guid-unsafe.json >/tmp/dreamy-harness-bad.json; then
  echo "unsafe harness fixture unexpectedly passed"
  exit 1
fi
jq -e '.status == "fail" and .exitCode == 1' /tmp/dreamy-harness-bad.json >/dev/null

if DREAMY_UNITY_PATH= UNITY_PATH= harness/dreamy-harness compile >/tmp/dreamy-harness-degraded.json; then
  echo "unsupported harness operation unexpectedly exited 0"
  exit 1
fi
jq -e '.status == "degraded" and .exitCode == 2 and .degradedReason' /tmp/dreamy-harness-degraded.json >/dev/null

echo "Harness evidence passed"
