"""Verify paths, sizes and SHA-256 recorded by extraction helpers; no media or Unity claims."""
import argparse
import json
import sys
from pathlib import Path

from _asset_common import digest, safe_parts


def verify(root):
    root = Path(root).resolve(strict=True)
    checked, failures, seen = 0, [], set()
    manifest = root / "manifest.jsonl"
    with manifest.open(encoding="utf-8") as stream:
        for line in stream:
            item = json.loads(line)
            if item.get("status") == "error":
                failures.append({"record": item, "error": "Producer reported an unresolved export error"})
            outputs = item.get("outputs", [item] if "path" in item else [])
            for output in outputs:
                try:
                    parts = safe_parts(output["path"])
                    path = root.joinpath(*parts)
                    if path.is_symlink() or not path.resolve().is_relative_to(root):
                        raise ValueError("Receipt path escapes output root")
                    key = "/".join(parts).casefold()
                    if key in seen:
                        raise ValueError("Duplicate output receipt")
                    seen.add(key)
                    if not path.is_file() or path.stat().st_size != output["bytes"] or digest(path) != output["sha256"]:
                        raise ValueError("Missing, truncated or changed output")
                    checked += 1
                except Exception as error:
                    failures.append({"path": output.get("path"), "error": str(error)})
    if not checked:
        failures.append({"error": "No output files verified; empty inventory is not verification"})
    summary_file = root / "summary.json"
    if not summary_file.is_file() or json.loads(summary_file.read_text(encoding="utf-8")).get("status") != "complete":
        failures.append({"error": "Producer summary is missing or not complete"})
    return {"status": "pass" if not failures else "fail", "files_verified": checked, "failures": failures,
            "scope": "Receipt identity/integrity only; no image/audio/video decoding, Unity import or gameplay verification."}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    args = parser.parse_args(argv)
    try:
        result = verify(args.output)
        print(json.dumps(result, ensure_ascii=True))
        return 0 if result["status"] == "pass" else 1
    except Exception as error:
        print(json.dumps({"status": "error", "error": str(error)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
