"""Local file/receipt primitives shared by the optional extraction helpers."""
import hashlib
import base64
import json
import re
from pathlib import Path, PurePosixPath


def digest(path):
    value = hashlib.sha256()
    with Path(path).open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


def fresh_output(path, inputs=()):
    target = Path(path).expanduser().resolve()
    if target.exists():
        raise ValueError(f"Output already exists; choose a fresh directory: {target}")
    for source in inputs:
        source = Path(source).resolve()
        if target == source or (source.is_dir() and target.is_relative_to(source)):
            raise ValueError("Output must be outside the input tree")
    target.mkdir(parents=True, exist_ok=False)
    return target


def safe_parts(name):
    path = PurePosixPath(name)
    if not name or path.is_absolute() or "\\" in name or "\x00" in name:
        raise ValueError(f"Unsafe archive path: {name!r}")
    parts = name.rstrip("/").split("/")
    for part in parts:
        stem = part.split(".")[0].upper()
        if (not part or part in {".", ".."} or re.search(r'[<>:"|?*\x00-\x1f]', part)
                or part.endswith((" ", ".")) or stem in {"CON", "PRN", "AUX", "NUL"}
                or re.fullmatch(r"(?:COM|LPT)[1-9]", stem)):
            raise ValueError(f"Unsafe/nonportable archive path: {name!r}")
    return parts


def safe_name(name):
    name = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", str(name)).strip(" .")[:100]
    try:
        safe_parts(name)
    except ValueError:
        name = "asset_" + name
    return name


def write_json(path, value):
    def encode(item):
        if isinstance(item, (bytes, bytearray, memoryview)):
            return {"encoding": "base64", "bytes": len(item), "data": base64.b64encode(item).decode("ascii")}
        raise TypeError(f"Unsupported JSON value: {type(item).__name__}")
    with Path(path).open("x", encoding="utf-8") as stream:
        json.dump(value, stream, ensure_ascii=True, indent=2, default=encode)
        stream.write("\n")


def receipt(path, root):
    return {"path": path.relative_to(root).as_posix(), "bytes": path.stat().st_size, "sha256": digest(path)}
