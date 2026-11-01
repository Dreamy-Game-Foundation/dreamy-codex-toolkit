"""Build per-file JSON links from an existing export without reading asset bodies.

This inventories files, metadata and optional JSONL producer receipts. It neither
extracts nor imports assets and never labels filename roles as verified bindings.
"""
import argparse
import hashlib
import json
import pathlib
import re
from urllib.parse import urlparse
from urllib.request import url2pathname


def asset_id(relative):
    return 'asset-' + hashlib.sha256(relative.encode('utf-8')).hexdigest()[:24]


def catalog(root, receipts=None):
    root = pathlib.Path(root).resolve(strict=True)
    if not root.is_dir():
        raise ValueError('Input must be an exported asset directory.')
    metadata = {}; objects = []
    if receipts:
        receipt_path = pathlib.Path(receipts).resolve(strict=True)
        with receipt_path.open(encoding='utf-8-sig') as stream:
            for line in stream:
                if not line.strip():
                    continue
                item = json.loads(line)
                obj = {key: item[key] for key in ('asset_file', 'source_file', 'path_id', 'type', 'name', 'status', 'error') if key in item}
                obj['outputAssetIds'] = []
                for output in item.get('outputs', []):
                    relative = output['path'].replace('\\', '/')
                    candidate = (root / relative).resolve()
                    if not candidate.is_relative_to(root):
                        raise ValueError('Receipt output escapes input root: ' + relative)
                    if relative in metadata:
                        raise ValueError('Duplicate receipt output: ' + relative)
                    metadata[relative] = dict(output, sourceObject={k: obj[k] for k in ('asset_file', 'source_file', 'path_id', 'type', 'status') if k in obj})
                    obj['outputAssetIds'].append(asset_id(relative))
                objects.append(obj)
    records = []; skipped = []
    for path in sorted(root.rglob('*')):
        if not path.is_file() or path.suffix == '.meta':
            continue
        relative = path.relative_to(root).as_posix()
        # Do not follow an exported symlink into unrelated content.
        if path.is_symlink() or not path.resolve().is_relative_to(root):
            skipped.append(dict(path=relative, reason='symlink-or-outside-root')); continue
        existing = metadata.get(relative, {}); guid = None
        meta = path.with_name(path.name + '.meta')
        if meta.is_file() and not meta.is_symlink():
            with meta.open(encoding='utf-8-sig', errors='replace') as stream:
                match = re.search(r'^guid: ([a-f0-9]{32})$', stream.read(1024), re.M)
            if match:
                guid = match.group(1)
        records.append(dict(id=asset_id(relative), path=relative, uri=path.resolve().as_uri(), name=path.stem,
                            extension=path.suffix, bytes=path.stat().st_size, guid=guid,
                            sourceObject=existing.get('sourceObject'),
                            sha256=existing.get('sha256'), hashStatus='producer-receipt-not-recomputed' if existing.get('sha256') else 'not-read',
                            availability='file-present', role=None, roleStatus='unassigned', importedBindings=[],
                            integrationStatus='not-verified'))
    present = {record['id'] for record in records}
    unresolved = [dict(path=relative, reason='receipt-output-missing') for relative in metadata if asset_id(relative) not in present]
    return dict(schemaVersion=1, sourceRoot=str(root), assetBodiesRead=0, records=records, sourceObjects=objects,
                skipped=skipped, unresolved=unresolved,
                limits='File existence and metadata links only. Empty, failed and retained source object states are preserved from receipts. Producer hashes are not recomputed. No import, playable game or exact-clone claim.')


def verify(data):
    errors = []; ids = set(); root = pathlib.Path(data['sourceRoot']).resolve()
    if not data['records']:
        errors.append('empty-catalog')
    for record in data['records']:
        if record['id'] in ids:
            errors.append('duplicate-id:' + record['id'])
        ids.add(record['id'])
        path = pathlib.Path(url2pathname(urlparse(record['uri']).path)).resolve()
        if not path.is_relative_to(root):
            errors.append('outside-root:' + record['path'])
        elif not path.is_file():
            errors.append('missing-file:' + record['path'])
        elif path.stat().st_size != record['bytes']:
            errors.append('changed-size:' + record['path'])
        if (root / record['path']).resolve() != path:
            errors.append('path-uri-mismatch:' + record['path'])
    errors += [item['reason'] + ':' + item['path'] for item in data.get('unresolved', [])]
    return dict(status='pass' if not errors else 'fail', files=len(ids), errors=errors,
                scope='Catalog/link/size consistency; asset body hashes, media validity, imported bindings and gameplay remain separate.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=pathlib.Path)
    parser.add_argument('--output', type=pathlib.Path, required=True)
    parser.add_argument('--object-receipts', type=pathlib.Path)
    parser.add_argument('--verify', action='store_true')
    args = parser.parse_args()
    if args.verify:
        data = json.loads(args.output.read_text(encoding='utf-8'))
    else:
        if not args.input:
            parser.error('--input is required when creating a catalog')
        if args.output.exists():
            parser.error('Output exists; use a new path or --verify. Do not overwrite an annotated catalog.')
        if args.output.resolve().is_relative_to(args.input.resolve()):
            parser.error('Keep catalog output outside the inventoried source directory.')
        data = catalog(args.input, args.object_receipts)
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    result = verify(data)
    print(json.dumps(result))
    return int(result['status'] != 'pass')


if __name__ == '__main__':
    raise SystemExit(main())
