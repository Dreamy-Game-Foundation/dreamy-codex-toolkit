"""Inspect/extract a ZIP-family package into a fresh directory; no nested execution."""
import argparse
import json
import stat
import sys
import zipfile
from pathlib import Path

from _asset_common import digest, fresh_output, receipt, safe_parts, write_json


def plan(package, prefixes=(), max_file=1024**3, max_total=8 * 1024**3):
    rows, destinations, files, total = [], set(), set(), 0
    for item in package.infolist():
        # ZipInfo normalizes Windows separators and truncates NULs in filename.
        # Admit the original archive spelling before using the normalized value.
        parts = safe_parts(item.orig_filename)
        key = "/".join(parts).casefold()
        if key in destinations:
            raise ValueError(f"Duplicate/case-colliding archive path: {item.filename}")
        destinations.add(key)
        mode = item.external_attr >> 16
        kind = stat.S_IFMT(mode)
        if kind not in (0, stat.S_IFREG, stat.S_IFDIR) or item.flag_bits & 1:
            raise ValueError(f"Linked, special or encrypted entry unsupported: {item.filename}")
        if not item.is_dir():
            files.add(key)
        selected = not item.is_dir() and (not prefixes or any(item.filename.startswith(p) for p in prefixes))
        if selected:
            if item.file_size > max_file:
                raise ValueError(f"Per-file byte limit exceeded: {item.filename}")
            total += item.file_size
            if total > max_total:
                raise ValueError("Total unpacked byte limit exceeded")
        rows.append({"archive_path": item.filename, "bytes": item.file_size, "compressed_bytes": item.compress_size,
                     "crc32": f"{item.CRC:08x}", "selected": selected})
    for row in rows:
        parts = safe_parts(row["archive_path"])
        if any("/".join(parts[:i]).casefold() in files for i in range(1, len(parts))):
            raise ValueError(f"Archive file is also a directory ancestor: {row['archive_path']}")
    return rows


def extract(source, output, prefixes=(), dry_run=False, max_file=1024**3, max_total=8 * 1024**3):
    source = Path(source).resolve(strict=True)
    before = digest(source)
    with zipfile.ZipFile(source) as package:
        rows = plan(package, prefixes, max_file, max_total)
        selected = [x for x in rows if x["selected"]]
        if not selected:
            raise ValueError("No files match the selected package scope")
        result = {"source": str(source), "source_sha256": before, "archive_entries": len(rows),
                  "selected_files": len(selected), "selected_unpacked_bytes": sum(x["bytes"] for x in selected)}
        if dry_run:
            return dict(result, status="dry_run", output=str(Path(output).resolve()))
        root = fresh_output(output, [source])
        (root / "files").mkdir()
        write_json(root / "inventory.json", rows)
        completed = 0
        try:
            with (root / "manifest.jsonl").open("x", encoding="utf-8") as log:
                for row in selected:
                    target = root / "files" / Path(*safe_parts(row["archive_path"]))
                    target.parent.mkdir(parents=True, exist_ok=True)
                    size = 0
                    with package.open(row["archive_path"]) as stream, target.open("xb") as destination:
                        while chunk := stream.read(1024 * 1024):
                            size += len(chunk)
                            if size > max_file or size > row["bytes"]:
                                raise ValueError("Actual entry bytes exceed the admitted size")
                            destination.write(chunk)
                    if size != row["bytes"]:
                        raise ValueError("Truncated archive entry")
                    log.write(json.dumps(dict(receipt(target, root), archive_path=row["archive_path"]), ensure_ascii=True) + "\n")
                    completed += 1
            if digest(source) != before:
                raise ValueError("Source changed during extraction")
        except Exception as error:
            write_json(root / "summary.json", dict(result, status="partial", completed_files=completed, error=str(error)))
            raise
    result.update(status="complete", completed_files=completed, source_unchanged=True)
    write_json(root / "summary.json", result)
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--include-prefix", action="append", default=[])
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--max-file-bytes", type=int, default=1024**3)
    parser.add_argument("--max-total-bytes", type=int, default=8 * 1024**3)
    args = parser.parse_args(argv)
    if min(args.max_file_bytes, args.max_total_bytes) < 1:
        parser.error("Byte limits must be positive")
    try:
        print(json.dumps(extract(args.source, args.output, args.include_prefix, args.dry_run,
                                 args.max_file_bytes, args.max_total_bytes), ensure_ascii=True))
        return 0
    except Exception as error:
        print(json.dumps({"status": "error", "error": str(error)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
