"""Decode explicitly selected JSON/plain or gzip:base64 files; no game-specific schema assumed."""
import argparse
import base64
import gzip
import io
import json
import sys
from pathlib import Path

from _asset_common import digest, fresh_output, receipt, write_json


def decode(content, limit):
    text = content.decode("utf-8-sig")
    compressed = text.startswith("gzip:")
    if compressed:
        with gzip.GzipFile(fileobj=io.BytesIO(base64.b64decode(text[5:], validate=True))) as stream:
            raw = stream.read(limit + 1)
    else:
        raw = text.encode("utf-8")
    if len(raw) > limit:
        raise ValueError("Decoded JSON exceeds configured byte limit")
    return json.loads(raw), compressed


def decode_folder(source, output, limit=32 * 1024**2):
    source = Path(source).resolve(strict=True)
    if not source.is_dir():
        raise ValueError("Source must be an explicitly selected data directory")
    files = sorted(source.rglob("*.json"))
    if not files:
        raise ValueError("No JSON files found")
    for path in files:
        if path.is_symlink() or not path.resolve().is_relative_to(source):
            raise ValueError("Source JSON links outside the selected tree are unsupported")
    root = fresh_output(output, [source])
    records, errors = [], []
    for path in files:
        record = {"source_path": path.relative_to(source).as_posix(), "source_sha256": digest(path)}
        try:
            if path.stat().st_size > limit * 2:
                raise ValueError("Encoded JSON exceeds input byte guard")
            value, compressed = decode(path.read_bytes(), limit)
            target = root / "files" / path.relative_to(source)
            target.parent.mkdir(parents=True, exist_ok=True)
            write_json(target, value)
            if digest(path) != record["source_sha256"]:
                raise ValueError("Source changed while decoding")
            record.update(receipt(target, root), status="decoded", gzip_decoded=compressed)
        except Exception as error:
            record.update(status="error", error=type(error).__name__ + ": " + str(error))
            errors.append(record)
        records.append(record)
    with (root / "manifest.jsonl").open("x", encoding="utf-8") as stream:
        for record in records:
            stream.write(json.dumps(record, ensure_ascii=True) + "\n")
    summary = {"status": "complete" if not errors else "partial", "source": str(source),
               "files": len(files), "decoded": len(files) - len(errors),
               "gzip_decoded": sum(x.get("gzip_decoded", False) for x in records), "errors": errors,
               "limits": ["JSON validity does not establish gameplay schema or runtime behavior; compare manifest counts separately."]}
    write_json(root / "summary.json", summary)
    return summary


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--max-decoded-bytes", type=int, default=32 * 1024**2)
    args = parser.parse_args(argv)
    if args.max_decoded_bytes < 1:
        parser.error("Byte limit must be positive")
    try:
        result = decode_folder(args.source, args.output, args.max_decoded_bytes)
        print(json.dumps(result, ensure_ascii=True))
        return 0 if result["status"] == "complete" else 2
    except Exception as error:
        print(json.dumps({"status": "error", "error": str(error)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
