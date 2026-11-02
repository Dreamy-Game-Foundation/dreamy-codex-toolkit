"""Source-free invariants for metadata-only per-file asset catalogs."""
import importlib.util
import json
import pathlib
import tempfile
import unittest
from unittest.mock import patch

ROOT=pathlib.Path(__file__).resolve().parents[2]
SPEC=importlib.util.spec_from_file_location('asset_catalog',ROOT/'skills/gameplay/game-asset-extraction/scripts/index_assets.py')
MODULE=importlib.util.module_from_spec(SPEC); SPEC.loader.exec_module(MODULE)


class CatalogTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(); self.base=pathlib.Path(self.temp.name)
        self.source=self.base/'export'; self.source.mkdir()
    def tearDown(self): self.temp.cleanup()

    def test_every_file_has_resolvable_unique_link_without_reading_asset_bodies(self):
        texture=self.source/'UI icons'/'đồng xu.png'; texture.parent.mkdir()
        texture.write_bytes(b'opaque-heavy-asset')
        texture.with_name(texture.name+'.meta').write_text('fileFormatVersion: 2\nguid: '+'a'*32+'\n',encoding='utf8')
        other=self.source/'mesh.obj'; other.write_bytes(b'opaque-mesh')
        original=pathlib.Path.open
        def guard(path,*args,**kwargs):
            if path.suffix in {'.png','.obj'}: raise AssertionError('Asset body was read')
            return original(path,*args,**kwargs)
        with patch.object(pathlib.Path,'open',guard):
            data=MODULE.catalog(self.source); result=MODULE.verify(data)
        self.assertEqual(result['status'],'pass'); self.assertEqual(result['files'],2)
        self.assertEqual(data['assetBodiesRead'],0)
        record=next(x for x in data['records'] if x['extension']=='.png')
        self.assertEqual(record['guid'],'a'*32); self.assertIn('%',record['uri'])
        self.assertEqual(record['hashStatus'],'not-read'); self.assertEqual(record['integrationStatus'],'not-verified')
        # IDs are relative-path based, independent of moving the export root.
        self.assertEqual(record['id'],MODULE.asset_id(record['path']))

    def test_receipts_keep_failed_empty_and_retained_objects_without_fabricating_files(self):
        (self.source/'pig.obj').write_bytes(b'not-opened')
        receipts=self.base/'objects.jsonl'
        records=[dict(asset_file='data',path_id=1,type='Mesh',status='exported',outputs=[dict(path='pig.obj',sha256='b'*64)]),
                 dict(asset_file='data',path_id=2,type='Texture2D',status='empty_source_texture'),
                 dict(asset_file='data',path_id=3,type='MonoBehaviour',status='retained_in_raw_unity_source'),
                 dict(asset_file='data',path_id=4,type='Texture2D',status='failed',error='Missing resource stream')]
        receipts.write_text('\n'.join(json.dumps(x) for x in records),encoding='utf8')
        data=MODULE.catalog(self.source,receipts)
        self.assertEqual(len(data['records']),1); self.assertEqual(len(data['sourceObjects']),4)
        self.assertEqual(data['records'][0]['hashStatus'],'producer-receipt-not-recomputed')
        self.assertEqual(data['sourceObjects'][3]['status'],'failed')
        self.assertEqual(MODULE.verify(data)['status'],'pass')

    def test_missing_receipt_file_and_path_escape_cannot_pass(self):
        receipts=self.base/'objects.jsonl'
        receipts.write_text(json.dumps(dict(status='exported',outputs=[dict(path='missing.png')])),encoding='utf8')
        data=MODULE.catalog(self.source,receipts)
        self.assertEqual(MODULE.verify(data)['status'],'fail')
        self.assertTrue(any('receipt-output-missing' in x for x in MODULE.verify(data)['errors']))
        receipts.write_text(json.dumps(dict(outputs=[dict(path='../outside.png')])),encoding='utf8')
        with self.assertRaisesRegex(ValueError,'escapes'): MODULE.catalog(self.source,receipts)

    def test_changed_file_duplicate_id_and_empty_catalog_fail(self):
        asset=self.source/'clip.wav'; asset.write_bytes(b'123')
        data=MODULE.catalog(self.source); asset.write_bytes(b'12345')
        self.assertEqual(MODULE.verify(data)['status'],'fail')
        data=MODULE.catalog(self.source); data['records'].append(data['records'][0])
        self.assertTrue(any('duplicate-id' in x for x in MODULE.verify(data)['errors']))
        asset.unlink(); self.assertEqual(MODULE.verify(MODULE.catalog(self.source))['status'],'fail')

    def test_same_named_assets_in_distinct_folders_remain_distinct(self):
        for folder in ['source','derived']:
            path=self.source/folder/'icon.png'; path.parent.mkdir(); path.write_bytes(b'x')
        data=MODULE.catalog(self.source)
        self.assertEqual(len({x['id'] for x in data['records']}),2)
        self.assertEqual(MODULE.verify(data)['status'],'pass')


if __name__=='__main__': unittest.main()
