# Đục asset bằng Game Asset Extraction

Skill [`game-asset-extraction`](../skills/gameplay/game-asset-extraction/SKILL.md) nhận gói game do bạn chọn, kiểm kê và giữ hash nguồn, xuất asset ra thư mục mới rồi kiểm tra kết quả. Có thể dùng độc lập hoặc được [`game-vibe-workflow`](game-vibe-workflow.vi.md) gọi khi làm clone/hybrid cần lấy asset từ bản build. Không cần REA; chọn REA `off` vẫn dùng được nhánh Unity.

Skill thuộc module `unity-core`, được phân phối qua các preset Unity/Dreamy có module này. Thêm skill vào repo không tự cập nhật những bản toolkit đã cài trước đó; dùng luồng install/update hiện có của toolkit cho đích cần dùng.

Sau extraction phải có **JSON link từng asset**, kể cả file chưa chọn. Có helper metadata-only, không đọc payload asset nặng:

```powershell
python skills/gameplay/game-asset-extraction/scripts/index_assets.py --input EXPORT_ROOT --output CATALOG.json
python skills/gameplay/game-asset-extraction/scripts/index_assets.py --output CATALOG.json --verify
```

Để output ngoài cây nguồn và dùng path mới; helper từ chối ghi đè catalog đã được gắn annotation. Có thể thêm `--object-receipts OBJECTS.jsonl` nếu producer ghi outputs bằng path tương đối với EXPORT_ROOT. Record có ID/path/URI/bytes/type extension/GUID, source-object/status và hash cũ hoặc `not-read`. Hash lấy từ receipt được ghi rõ chưa tính lại. Link/size pass không chứng minh file media đúng, đã import hay gameplay hoàn thiện.

Khi làm clone y hệt, đưa catalog sang [nhánh exact-clone](../skills/gameplay/game-vibe-workflow/references/exact-clone.md): mỗi màn phải nối source assetID → imported path/GUID → component/prefab → capture. Có asset gốc phù hợp thì hoàn thiện trọn luồng, không dừng ở import hoặc giữ placeholder cho tiện.

## Prompt mẫu

```text
Use $game-asset-extraction.
Đục asset từ XAPK tại đường dẫn tôi cung cấp, xuất sang một thư mục mới.
Ưu tiên sprite, texture, mesh, audio, font và dữ liệu level.
Kiểm kê/hash trước; thử một mẫu trước khi xuất toàn bộ.
Giữ nguyên nguồn, ghi lỗi và kiểm tra file đầu ra. REA: off.
```

```text
Use $game-vibe-workflow để làm slice clone từ reference tôi cung cấp.
Khi xử lý gói build đã chọn, dùng $game-asset-extraction.
Chọn một nhóm asset phù hợp, import một mẫu vào Unity và kiểm tra gameplay
trước khi đưa toàn bộ asset vào project. REA: auto.
```

Có thể chỉ yêu cầu kiểm kê, lấy một nhóm asset, giải mã level hoặc xuất cấu trúc prefab/scene. Skill không tự tìm game khác trên máy và không tự lấy asset chỉ vì brief có chữ clone.

## Công cụ và đầu ra

Các helper nằm trong thư mục `scripts/` của skill. Chạy `--help` để xem tham số; đường dẫn ví dụ được giải thích trong [hướng dẫn intake](../skills/gameplay/game-asset-extraction/references/archive-and-tools.md) và [Unity export](../skills/gameplay/game-asset-extraction/references/unity-export.md).

| Helper | Phạm vi |
|---|---|
| `extract_package.py` | Python 3.10+, thư viện chuẩn; kiểm kê/giải nén ZIP/APK/XAPK, chọn prefix, giới hạn byte, không chạy nội dung |
| `export_unity.py` | UnityPy tùy chọn trong môi trường riêng; PNG/OBJ/audio/font/video/TextAsset và JSON một số loại serialized object |
| `decode_levels.py` | JSON thường hoặc chuỗi `gzip:` + base64 đã nhận diện; giới hạn kích thước giải nén, giữ đường dẫn tương đối |
| `verify_manifest.py` | Kiểm tra đường dẫn, kích thước và SHA-256 theo receipt; báo lỗi nếu producer còn partial/error |

Helper từ chối thư mục đầu ra đã tồn tại. Khi tiếp tục một lần chạy dở, đọc report trước rồi chọn thư mục mới cho phần cần chạy lại. Không xóa kết quả cũ để retry. Gói lồng nhau được kiểm kê và xử lý riêng; giải nén XAPK chưa đồng nghĩa đã decode Unity.

AssetRipper là lựa chọn ngoài toolkit khi cần cấu trúc project Unity, prefab, scene và material. Kiểm tra phiên bản, log, đầu ra và đường dẫn đích trước khi chạy: exporter có thể xóa dữ liệu ở đích xuất. Toolkit không kèm binary, không cài Python package toàn cục và không đổi cấu hình REA.

## Kiểm chứng và giới hạn

Receipt khớp hash chỉ chứng minh danh tính/toàn vẹn file. Cần kiểm tra định dạng, xem/nghe mẫu và kiểm tra import trong engine theo [validation](../skills/gameplay/game-asset-extraction/references/validation.md). Compile, Play Mode, player build và độ giống gameplay là các bước riêng.

Case [Pixel Flow](../skills/gameplay/game-asset-extraction/references/pixel-flow-case.md) đã xuất được asset và 3.117 định nghĩa level. Project AssetRipper chứa dummy script/shader; chưa chứng minh chạy lại game. Texture runtime 0×0 không có pixel được ghi nhận là dữ liệu rỗng, không tạo ảnh giả. Mất sidecar/resource hoặc lỗi decoder phải giữ là lỗi.

Skill hiện `experimental`. [Evidence đã lược bỏ dữ liệu nguồn](evidence/game-asset-extraction-pixelflow.json) tách kết quả case gốc, pilot của helper dùng lại được và các kiểm tra chưa chạy. Test tự động dùng fixture tổng hợp; eval catalog chứa tình huống mong đợi, chưa phải bằng chứng model xử lý thành công mọi game/engine.
