# Unity UI Responsive

Skill [`unity-ui-responsive`](../skills/unity-ui-responsive/SKILL.md) kiểm tra và sửa responsive trong phạm vi prefab UI được giao, kể cả binding/animation ảnh hưởng trình bày và consumer của widget dùng chung. Skill đang ở mức experimental: đã kiểm tra cấu trúc và đường phân phối, chưa có bằng chứng thực thi trên UI Unity thật.

Theo chỉ dẫn bổ sung của người dùng, **giữ quy tắc thêm SafeArea** cho panel/popup/HUD/overlay và UI mobile như trước; background phủ toàn màn hình nằm ngoài SafeArea. Nếu parent đã sở hữu inset thì dùng lại, tránh inset kép. Quy tắc popup không bắt buộc SafeArea trong đề bài ban đầu đã được thay bằng chỉ dẫn này. Chính sách chi tiết có một owner tại [layout-and-safe-area.md](../skills/unity-ui-responsive/references/layout-and-safe-area.md); các skill UI/prefab/mobile/testing chỉ dẫn tới skill đó.

## Kích hoạt và phân phối

Implicit invocation được bật trong `agents/openai.yaml`. Agent có thể chọn skill khi tạo/sửa panel, popup, HUD, widget, layout, sprite, font, text, animation hoặc binding sinh nội dung ảnh hưởng bố cục. Có thể gọi rõ `$unity-ui-responsive`. Thay đổi nghiệp vụ không ảnh hưởng trình bày hoặc prefab gameplay không có UI nằm ngoài phạm vi.

Catalog là `skills/index.json`; installer lấy thư mục skill từ `modules/unity-core/module.json`, sao chép cả thư mục khi install/update. Các preset phụ thuộc `unity-core` nhận skill này; không cần sửa từng preset hay thêm registry/router mới. Các skill liên quan đã có chỉ dẫn chuyển sang workflow responsive khi sửa trình bày. `core` và preset package không có `unity-core` không tự nhận skill UI này.

Từ checkout toolkit, người dùng có thể xem kế hoạch rồi tự cài global:

```bash
node src/cli.js install --target global --preset dreamy-production --dry-run --json
node src/cli.js install --target global --preset dreamy-production
```

Nếu đã cài, dùng `update` với preset muốn giữ:

```bash
node src/cli.js update --target global --preset dreamy-production --dry-run --json
node src/cli.js update --target global --preset dreamy-production
```

Đây là hướng dẫn để người dùng tự chạy; công việc phát triển này chỉ cài/update/uninstall trong home tạm qua `DREAMY_CODEX_HOME` và `DREAMY_AGENTS_HOME`. Skill là hướng dẫn agent đọc, không phải automation tự chạy. Không bổ sung hook, model call nền, thu thập transcript hoặc sửa cấu hình tài khoản.

## Nghiên cứu và rà tình huống

Đã đối chiếu tài liệu chính thức: [Canvas Scaler uGUI 2.0](https://docs.unity3d.com/Packages/com.unity.ugui@2.0/manual/script-CanvasScaler.html), [Auto Layout](https://docs.unity3d.com/Packages/com.unity.ugui@2.0/manual/UIAutoLayout.html), [Image.preserveAspect](https://docs.unity3d.com/Packages/com.unity.ugui@2.0/api/UnityEngine.UI.Image.html#UnityEngine_UI_Image_preserveAspect) và [Screen.safeArea Unity 6000.0](https://docs.unity.com/en-us/engine/6000.0/script-reference/unityengine/screen/safearea). Reference của skill giữ các liên kết và giới hạn phiên bản. Đây không phải xác nhận compatibility cho consumer bất kỳ.

Các tình huống dưới đây đã được **rà bằng suy luận trên nội dung skill**, chưa thực thi agent độc lập hay sửa/render prefab thật:

| Tình huống | Quyết định sau rà |
| --- | --- |
| Widget dùng chung có HUD hẹp và popup dùng layout group | Kiểm tra cả hai hợp đồng parent, count dài và instance override; sửa trong phạm vi consumer bị ảnh hưởng. |
| Popup giữa màn hình không có SafeArea, parent cũng chưa sở hữu | Giữ chính sách thêm owner/container hiện có; dialog vẫn giữa màn hình, background bên ngoài, action truy cập được. |
| Popup thiếu component cục bộ nhưng parent có SafeArea | Dùng owner parent; không inset hai lần. |
| HUD bị notch trái che action | Sửa đúng owner, thử notch bất đối xứng và chiều landscape ngược, giữ background full bleed. |
| Formation đặt slot theo parent rộng nhưng ảnh PreserveAspect | Đồng bộ tọa độ/scale với vùng ảnh thực; kiểm tra slot spawn, override, toàn bounds và hit target. |
| Tween đưa scale về 1 trong khi fit cần 0.8 | Tách transform fit/layout khỏi transform tween; giữ preset và kiểm tra reopen/resize. |
| Thiếu Editor, capture và thiết bị | Hoàn thành phần an toàn có thể làm; báo rõ static evidence và các lớp not-run, không tuyên bố pass render/touch. |
| Projectile chỉ đổi damage, không có UI | Không kích hoạt audit responsive/SafeArea. |
| Binding tăng số item làm item cuối không truy cập được | Vẫn kích hoạt skill; kiểm tra content/viewport/scroll và runtime binding thật khi có công cụ. |

Bộ prompt tái sử dụng nằm ở `benchmarks/cases/ui-responsive.json`; chuẩn bị bằng runner hiện có:

```bash
node scripts/benchmark.mjs --manifest benchmarks/manifests/ui-responsive.json --prepare --output /tmp/dreamy-ui-responsive-review
```

Lệnh chỉ chuẩn bị prompt, provenance/hash nguồn và báo **9 not-run / degraded**, không gọi model. Trường `manualReview` giữ tiêu chí để người đánh giá xem actions/evidence thực tế; runner không tự chấm trường này. Grader JSON chỉ kiểm tra quyết định cấp cao; kể cả grader pass cũng không chứng minh agent sửa prefab đúng, implicit discovery, render hoặc input. Chỉ chạy model khi có yêu cầu/ủy quyền riêng, không dùng adapter giả để tuyên bố chất lượng.

## Kiểm chứng bàn giao

- `python3 <skill-creator>/scripts/quick_validate.py skills/unity-ui-responsive`: frontmatter hợp lệ.
- `node scripts/validate-skills.mjs`: catalog/metadata/reference và giới hạn compact entrypoint hợp lệ.
- `node --test tests/unit/ui-responsive-distribution.test.mjs`: resolved presets, dry-run không ghi home, install/update giữ nguyên byte cả skill/reference/metadata, uninstall trong home tạm.
- `npm test`: validation toolkit và 147 unit test; 146 pass, 0 fail, 1 skip (PowerShell installer chỉ chạy trên Windows; môi trường hiện tại là Linux).
- Kiểm tra nội dung npm package bằng `npm pack --dry-run --json --ignore-scripts` và đối chiếu các file skill/reference/metadata.

Không có consumer UI Unity trong phạm vi công việc này để xác minh geometry fixture, prefab render, Play Mode, Simulator hoặc thiết bị thật. Không lấy project-inspect/compile/schema pass thay cho các lớp bằng chứng đó; không tuyên bố tương thích mọi điện thoại.

[Biên nhận kiểm chứng](evidence/unity-ui-responsive-validation.json) ghi riêng dữ kiện quan sát, hợp đồng dự kiến và phần chưa được xác minh, cùng hash đầu vào liên quan.
