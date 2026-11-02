"""Source-free regression fixtures; no UnityPy installation, game or network required."""
import base64
import gzip
import json
import stat
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

SCRIPTS = Path(__file__).resolve().parents[2] / "skills/gameplay/game-asset-extraction/scripts"
sys.path.insert(0, str(SCRIPTS))
import decode_levels
import export_unity
import extract_package
import verify_manifest
from _asset_common import digest


class ExtractionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="dreamy-asset-tests-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def archive(self, rows):
        path = self.root / "input.xapk"
        with zipfile.ZipFile(path, "w", zipfile.ZIP_STORED) as stream:
            for name, value in rows:
                stream.writestr(name, value)
        return path

    def test_extract_preserves_bytes_hash_and_unicode_and_verifies(self):
        source = self.archive([("assets/level.json", b'{"level":1}'), ("assets/日本語.txt", b"text"), ("native.bin", b"binary")])
        before = digest(source)
        output = self.root / "out"
        result = extract_package.extract(source, output, prefixes=["assets/"])
        self.assertEqual(result["completed_files"], 2)
        self.assertEqual((output / "files/assets/日本語.txt").read_bytes(), b"text")
        self.assertFalse((output / "files/native.bin").exists())
        self.assertEqual(digest(source), before)
        self.assertEqual(verify_manifest.verify(output)["status"], "pass")

    def test_dry_run_has_no_output_and_existing_output_is_preserved(self):
        source = self.archive([("asset.txt", b"value")])
        output = self.root / "out"
        self.assertEqual(extract_package.extract(source, output, dry_run=True)["status"], "dry_run")
        self.assertFalse(output.exists())
        output.mkdir()
        (output / "sentinel").write_bytes(b"keep")
        with self.assertRaises(ValueError):
            extract_package.extract(source, output)
        self.assertEqual((output / "sentinel").read_bytes(), b"keep")

    def test_unsafe_archive_names_are_rejected_before_writes(self):
        for name in ["../escape", "/absolute", "C:/drive", "a\\escape", "CON.txt", "file:stream", "a/../b", "a./b"]:
            with self.subTest(name=name):
                entry = zipfile.ZipInfo("fixture")
                entry.filename = entry.orig_filename = name
                source = self.archive([(entry, b"data")])
                output = self.root / "out"
                with self.assertRaises(ValueError):
                    extract_package.extract(source, output)
                self.assertFalse(output.exists())

    def test_case_collisions_and_file_directory_conflicts_are_rejected(self):
        for rows in [[("A.txt", b"a"), ("a.txt", b"b")], [("parent", b"a"), ("parent/child", b"b")]]:
            with self.subTest(rows=rows):
                source = self.archive(rows)
                with self.assertRaises(ValueError):
                    extract_package.extract(source, self.root / "out")
                self.assertFalse((self.root / "out").exists())

    def test_archive_links_and_limits_are_rejected(self):
        entry = zipfile.ZipInfo("link")
        entry.create_system = 3
        entry.external_attr = (stat.S_IFLNK | 0o777) << 16
        source = self.archive([(entry, "../elsewhere")])
        with self.assertRaises(ValueError):
            extract_package.extract(source, self.root / "out")
        source = self.archive([("big", b"0123456789")])
        for options in [{"max_file": 5}, {"max_total": 5}]:
            with self.assertRaises(ValueError):
                extract_package.extract(source, self.root / "out", **options)
        self.assertFalse((self.root / "out").exists())

    def test_crc_failure_retains_partial_state_without_false_success(self):
        source = self.archive([("broken", b"unique-payload")])
        source.write_bytes(source.read_bytes().replace(b"unique-payload", b"broken-payload"))
        output = self.root / "out"
        with self.assertRaises(zipfile.BadZipFile):
            extract_package.extract(source, output)
        self.assertEqual(json.loads((output / "summary.json").read_text())["status"], "partial")
        self.assertEqual(verify_manifest.verify(output)["status"], "fail")

    def test_decode_plain_and_gzip_preserves_input_and_relative_paths(self):
        source = self.root / "levels"
        (source / "group").mkdir(parents=True)
        value = {"pixels": [{"x": 1, "color": "red"}]}
        encoded = b"gzip:" + base64.b64encode(gzip.compress(json.dumps(value).encode()))
        (source / "group/1.json").write_bytes(encoded)
        (source / "manifest.json").write_text('{"count":1}')
        output = self.root / "decoded"
        result = decode_levels.decode_folder(source, output)
        self.assertEqual(result["decoded"], 2)
        self.assertEqual(result["gzip_decoded"], 1)
        self.assertEqual(json.loads((output / "files/group/1.json").read_text()), value)
        self.assertEqual((source / "group/1.json").read_bytes(), encoded)
        self.assertEqual(verify_manifest.verify(output)["status"], "pass")

    def test_decoder_limits_malformed_input_and_output_inside_source(self):
        huge = b"gzip:" + base64.b64encode(gzip.compress(json.dumps("x" * 1000).encode()))
        for content in [huge, b"gzip:invalid!", b"not-json"]:
            with self.assertRaises((ValueError, OSError, EOFError)):
                decode_levels.decode(content, 50)
        source = self.root / "data"
        source.mkdir()
        (source / "bad.json").write_bytes(b"not-json")
        with self.assertRaises(ValueError):
            decode_levels.decode_folder(source, source / "child")
        self.assertFalse((source / "child").exists())
        result = decode_levels.decode_folder(source, self.root / "decoded")
        self.assertEqual(result["status"], "partial")
        self.assertEqual(verify_manifest.verify(self.root / "decoded")["status"], "fail")

    def test_manifest_rejects_tampering_escape_missing_summary_and_empty_success(self):
        source = self.archive([("a", b"original")])
        output = self.root / "out"
        extract_package.extract(source, output)
        (output / "files/a").write_bytes(b"tampered")
        self.assertEqual(verify_manifest.verify(output)["status"], "fail")
        (output / "files/a").write_bytes(b"original")
        (output / "summary.json").unlink()
        self.assertEqual(verify_manifest.verify(output)["status"], "fail")
        (output / "summary.json").write_text('{"status":"complete"}')
        (output / "manifest.jsonl").write_text(json.dumps({"path": "../input.xapk", "bytes": source.stat().st_size, "sha256": digest(source)}) + "\n")
        self.assertEqual(verify_manifest.verify(output)["status"], "fail")
        (output / "manifest.jsonl").write_text("")
        self.assertEqual(verify_manifest.verify(output)["status"], "fail")

    def test_empty_texture_does_not_create_fabricated_pixels(self):
        asset = SimpleNamespace(m_Name="Font Texture", m_Width=0, m_Height=0, image_data=b"", m_StreamData=SimpleNamespace(size=0))
        obj = SimpleNamespace(type=SimpleNamespace(name="Texture2D"), path_id=1, parse_as_object=lambda: asset)
        output = self.root / "out"
        result = export_unity.export_object(obj, output, "source")
        self.assertEqual(result["status"], "empty_runtime_texture")
        self.assertEqual(result["outputs"], [])
        self.assertFalse(output.exists())

    def test_missing_resource_is_not_relabelled_empty(self):
        class MissingTexture:
            m_Name = "Actual texture"
            m_Width = m_Height = 16
            image_data = b""
            m_StreamData = SimpleNamespace(size=128)

            @property
            def image(self):
                raise FileNotFoundError("missing source resource")

        obj = SimpleNamespace(type=SimpleNamespace(name="Texture2D"), path_id=1, parse_as_object=MissingTexture)
        with self.assertRaises(FileNotFoundError):
            export_unity.export_object(obj, self.root / "out", "source")

    def test_same_named_objects_from_different_collections_remain_distinct(self):
        source = self.root / "source.bundle"
        source.write_bytes(b"synthetic fixture")
        objects = []
        for payload in [b"one", b"two"]:
            asset = SimpleNamespace(m_Name="same/name", m_Script=payload)
            objects.append(SimpleNamespace(type=SimpleNamespace(name="TextAsset"), path_id=5,
                                           assets_file=SimpleNamespace(name="same.assets", unity_version="test"),
                                           parse_as_object=lambda value=asset: value))
        fake = SimpleNamespace(__version__="fixture", load=lambda *args: SimpleNamespace(objects=objects))
        output = self.root / "out"
        with patch.dict(sys.modules, {"UnityPy": fake}):
            result = export_unity.run([source], output, types=["TextAsset"])
        self.assertEqual(result["exported_objects"]["TextAsset"], 2)
        self.assertEqual({p.read_bytes() for p in (output / "files").rglob("*.bytes")}, {b"one", b"two"})
        self.assertEqual(verify_manifest.verify(output)["status"], "pass")


if __name__ == "__main__":
    unittest.main()
