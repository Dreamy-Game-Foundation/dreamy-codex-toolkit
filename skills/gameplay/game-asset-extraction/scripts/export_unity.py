"""Export selected Unity objects using an installed UnityPy; never installs tools or runs a game."""
import argparse
import collections
import json
import sys
from pathlib import Path

from _asset_common import digest, fresh_output, receipt, safe_name, write_json

TARGETS = {"Texture2D", "Sprite", "Mesh", "AudioClip", "Font", "VideoClip", "TextAsset",
           "Material", "AnimationClip", "AnimatorController", "SpriteAtlas", "PhysicMaterial"}


def export_object(obj, root, group):
    kind = obj.type.name
    asset = obj.parse_as_object()
    name = getattr(asset, "m_Name", "") or f"asset_{obj.path_id}"
    result = {"name": str(name), "outputs": []}
    if kind == "Texture2D" and asset.m_Width == 0 and asset.m_Height == 0 and not asset.image_data and asset.m_StreamData.size == 0:
        return dict(result, status="empty_runtime_texture", reason="Zero dimensions and no embedded/streamed pixels in source")
    folder = root / "files" / kind / group
    folder.mkdir(parents=True, exist_ok=True)
    stem = safe_name(name) + "__" + str(obj.path_id)
    paths = []
    if kind in {"Texture2D", "Sprite"}:
        target = folder / (stem + ".png")
        image = asset.image
        with target.open("xb") as stream:
            image.save(stream, format="PNG")
        result["image_size"] = list(image.size)
        paths.append(target)
    elif kind == "Mesh":
        target = folder / (stem + ".obj")
        with target.open("x", encoding="utf-8", newline="") as stream:
            stream.write(asset.export())
        paths.append(target)
    elif kind == "AudioClip":
        for index, (sample, data) in enumerate(asset.samples.items()):
            suffix = Path(sample).suffix.lower()
            if suffix not in {".wav", ".ogg", ".mp3", ".flac", ".aif", ".aiff"}:
                suffix = ".bin"
            target = folder / (stem + f"__{index}" + suffix)
            with target.open("xb") as stream:
                stream.write(data)
            paths.append(target)
        if not paths:
            raise ValueError("AudioClip has no decoded samples")
        result["duration_seconds"] = getattr(asset, "m_Length", None)
    elif kind == "Font":
        content = bytes(asset.m_FontData)
        if not content:
            return dict(result, status="empty_embedded_font")
        target = folder / (stem + (".otf" if content[:4] == b"OTTO" else ".ttf"))
        with target.open("xb") as stream:
            stream.write(content)
        paths.append(target)
    elif kind == "TextAsset":
        content = asset.m_Script
        if isinstance(content, str):
            content = content.encode("utf-8", "surrogateescape")
        target = folder / (stem + ".bytes")
        with target.open("xb") as stream:
            stream.write(content)
        paths.append(target)
    elif kind == "VideoClip":
        from UnityPy.helpers.ResourceReader import get_resource_data
        resource = asset.m_ExternalResources
        content = get_resource_data(resource.m_Source, obj.assets_file, resource.m_Offset, resource.m_Size)
        if len(content) != resource.m_Size:
            raise ValueError("Video resource is truncated")
        suffix = Path(asset.m_OriginalPath).suffix.lower()
        if suffix not in {".mp4", ".mov", ".m4v", ".webm", ".avi"}:
            suffix = ".bin"
        target = folder / (stem + suffix)
        with target.open("xb") as stream:
            stream.write(content)
        paths.append(target)
    else:
        target = folder / (stem + ".json")
        write_json(target, obj.parse_as_dict())
        paths.append(target)
    result.update(status="exported", outputs=[receipt(path, root) for path in paths])
    return result


def run(inputs, output, types=None, per_type_limit=None):
    import UnityPy
    sources = [Path(path).resolve(strict=True) for path in inputs]
    if any(not path.is_file() for path in sources):
        raise ValueError("Pass explicit data/bundle/resource files, not a whole directory")
    selected = set(types or TARGETS)
    if not selected <= TARGETS:
        raise ValueError("Requested type has no exporter; inspect the source instead")
    identities = [{"path": str(path), "bytes": path.stat().st_size, "sha256": digest(path)} for path in sources]
    env = UnityPy.load(*(str(path) for path in sources))
    root = fresh_output(output, sources)
    counts, statuses, attempted, exported = (collections.Counter() for _ in range(4))
    groups, errors, versions = {}, [], set()
    with (root / "manifest.jsonl").open("x", encoding="utf-8") as log:
        for obj in env.objects:
            kind = obj.type.name
            counts[kind] += 1
            record = {"asset_file": obj.assets_file.name, "path_id": obj.path_id, "type": kind}
            versions.add(str(obj.assets_file.unity_version))
            if kind not in selected or (per_type_limit is not None and attempted[kind] >= per_type_limit):
                record["status"] = "retained_in_source"
            else:
                attempted[kind] += 1
                identity = id(obj.assets_file)
                if identity not in groups:
                    groups[identity] = f"{len(groups) + 1:04d}_" + safe_name(obj.assets_file.name)
                try:
                    record.update(export_object(obj, root, groups[identity]))
                    if record["status"] == "exported":
                        exported[kind] += 1
                except Exception as error:
                    record.update(status="error", error=type(error).__name__ + ": " + str(error))
                    errors.append(record.copy())
            statuses[record["status"]] += 1
            log.write(json.dumps(record, ensure_ascii=True) + "\n")
    for item in identities:
        if digest(item["path"]) != item["sha256"]:
            errors.append({"source": item["path"], "error": "Source changed during export"})
    result = {"status": "complete" if not errors else "partial", "tool": "UnityPy", "version": UnityPy.__version__,
              "sources": identities, "unity_versions": sorted(versions), "selected_types": sorted(selected),
              "per_type_limit": per_type_limit, "object_counts": dict(counts), "statuses": dict(statuses),
              "exported_objects": dict(exported), "errors": errors,
              "limits": ["Only selected types/scope were exported; custom behaviours remain in source.",
                         "OBJ and JSON exports do not reconstruct working Unity scenes, shaders, scripts or gameplay.",
                         "Receipt hashes prove output identity, not media fidelity or Unity import success."]}
    write_json(root / "summary.json", result)
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, action="append", required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--type", choices=sorted(TARGETS), action="append", dest="types")
    parser.add_argument("--per-type-limit", type=int)
    args = parser.parse_args(argv)
    if args.per_type_limit is not None and args.per_type_limit < 1:
        parser.error("Per-type limit must be positive")
    try:
        result = run(args.input, args.output, args.types, args.per_type_limit)
        print(json.dumps(result, ensure_ascii=True))
        return 0 if result["status"] == "complete" else 2
    except ImportError:
        print(json.dumps({"status": "unavailable", "error": "Install scripts/requirements-unity.txt in an isolated environment for Unity export; no automatic installation was attempted."}), file=sys.stderr)
        return 1
    except Exception as error:
        print(json.dumps({"status": "error", "error": str(error)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
