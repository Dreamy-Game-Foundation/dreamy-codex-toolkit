# Tạo VFX 2D/3D bằng unity-vfx-authoring

Skill experimental [`unity-vfx-authoring`](../skills/unity-vfx-authoring/SKILL.md) nằm trong module `unity-core`. Dùng để tạo mới hoặc thay đổi rõ rệt hiệu ứng từ mô tả, ảnh/video tham chiếu hay asset sẵn có, với prefab chỉnh sửa được và kiểm chứng phù hợp task. Không cần có ảnh reference cho mọi yêu cầu.

## Quy trình

1. Inspect project, renderer thực tế, camera, asset và owner; chốt mục tiêu, timing, platform và phạm vi.
2. Phân rã hiệu ứng thành các lớp có vai trò, rồi chọn Particle System, sprite/flipbook, mesh/material, line/trail hoặc VFX Graph đủ capability.
3. Chọn nguyên liệu có sẵn, procedural, được cung cấp/cấp phép hoặc AI theo nhu cầu; kiểm tra alpha, pivot và continuity của animation.
4. Author phiên bản nhỏ đủ đánh giá, lưu/reload prefab và dependencies; preview onset/peak/tail cùng chuyển động trong context thật.
5. Chỉnh tiêu chí còn sai; tích hợp trigger/stop, reset và release theo owner, giữ gameplay authority ngoài VFX.
6. Kiểm tra vòng đời, số lượng đồng thời và ngân sách đúng target; bàn giao asset, tham số, bằng chứng và gap.

## Prompt ví dụ

```text
Use $unity-vfx-authoring tạo hit 2D màu vàng theo style hiện có trong project.
Dùng Particle System và texture đang có hoặc procedural; không dùng AI, không build player.
Hiệu ứng một lần, peak khớp hit event, tail không bị cắt khi tái sử dụng.
Giao prefab, hướng dẫn trigger/stop và capture ở camera gameplay.
```

```text
Use $unity-vfx-authoring tạo explosion 3D gồm flash, sparks và smoke.
Inspect renderer và các effect sẵn có trước. Target và số instance đồng thời
lấy theo brief project; ghi rõ nếu ngân sách chưa được đo trên thiết bị.
Giao prefab chỉnh sửa được, preview nhiều mốc và kiểm tra stop/reuse.
```

```text
Use $unity-vfx-authoring chỉ lập plan cho shield theo video tham chiếu.
Đề xuất layer/timeline, lựa chọn kỹ thuật và acceptance; chưa sửa asset.
```

Nếu yêu cầu đúng VFX Graph, skill phải kiểm tra resolved package, renderer, tool authoring và target API. Thiếu capability thì ghi gap, không tự đổi pipeline hoặc gọi fallback là graph đã đạt. Effect trong Canvas cần đúng đường render/mask, không chỉ tăng sorting order của particle world.

## Đầu ra và giới hạn

Với task đủ lớn có thể dùng [brief](../skills/unity-vfx-authoring/assets/effect-brief.md) và [recipe](../skills/unity-vfx-authoring/assets/effect-recipe.json). Tách facts đã quan sát, dự định và điều chưa biết. Các số chưa đo giữ null; ghi units/configuration cho metric thực tế.

Prefab được lưu, compile/import, hình ảnh được chọn, vòng đời đúng, hiệu năng đạt target và player/device chạy được là các kết quả độc lập. Không có Editor thì phần Unity là not-run/degraded; code hoặc JSON được tạo không chứng minh render. Giữ phạm vi no-AI/no-build và không bắt tạo framework/pool mới cho một effect đơn lẻ.

Xem [receipt kiểm chứng](evidence/unity-vfx-authoring-validation.json) cho kết quả thực tế và giới hạn pilot. Catalog eval chỉ là đặc tả, không phải semantic agent pass. Toolkit không phân phối binary/asset bên thứ ba, không tự cài VFX Graph hoặc đăng ký MCP/provider. Thực thi trong project đích vẫn cần inspect manifest/lock và owner hiện tại.

## Pilot đã chạy

Unity 6000.4.12f1, Built-in, Direct3D12 trên GTX 1650: ba prefab mẫu được lưu/nạp lại, chín capture theo thời gian và các capture PlayMode trên nền sáng/tối. Ba PlayMode case đạt cho hit tự kết thúc, explosion giữ child tail rồi cancel/replay, và trail clear/relocate/reuse. Đây là kiểm tra lab, chưa phải gameplay integration, fidelity theo reference, benchmark mobile hay hỗ trợ VFX Graph.

| Mẫu | Preview nền tối | Preview nền sáng |
|---|---|---|
| Hit 2D | [Ảnh](evidence/vfx-authoring-20261102/Hit2D-live-dark.png) | [Ảnh](evidence/vfx-authoring-20261102/Hit2D-live-light.png) |
| Explosion 3D | [Ảnh](evidence/vfx-authoring-20261102/Explosion3D-live-dark.png) | [Ảnh](evidence/vfx-authoring-20261102/Explosion3D-live-light.png) |
| Trail | [Ảnh](evidence/vfx-authoring-20261102/AuraTrail-live.png) | [Ảnh](evidence/vfx-authoring-20261102/AuraTrail-live-light.png) |

Các ảnh là output procedural của lab. Prefab/source/log/test XML gốc nằm trong lab local bị gitignore; receipt ghi hash để kiểm tra tại workspace này. Repo giữ ảnh, authoring report và PlayMode summary, không đóng gói toàn bộ project Unity hoặc một framework VFX runtime.

Skill được phân phối qua các preset chứa `unity-core`; project đã cài toolkit cần dùng CLI checkout mới để update đúng target. Không tự thay global config hoặc cập nhật project đang mở chỉ vì có skill mới. [Kế hoạch và checkpoint](plans/UNITY_VFX_AUTHORING_SKILL_PLAN.vi.md) ghi phạm vi triển khai.
