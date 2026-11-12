# Sử dụng unity-shader

`$unity-shader` giúp tạo, sửa lỗi hoặc tối ưu shader Unity theo project hiện có. Workflow mới ở trạng thái **experimental**, giữ trong module `unity-rendering`, được cài qua `unity-full` hoặc `dreamy-full`. Task nâng cấp này không tự cập nhật bản global của người dùng.

Ví dụ:

```text
Use $unity-shader to create a dissolve shader for this character.
Keep the current pipeline/packages. Expose edge color and dissolve amount;
verify values 0, 0.5 and 1, including the relevant shadow/depth behavior.
```

```text
Use $unity-shader to debug the shader that works in Editor but loses its
runtime keyword feature in a player. Preserve appearance and inspect stripping.
```

```text
Use $unity-shader to optimize this device capture. Keep visual acceptance,
compare the same workload, and report GPU time separately from build size.
```

Đầu vào có thể chỉ là mô tả chữ. Với yêu cầu lớn, dùng [brief](../skills/unity-shader/assets/shader-brief.md) để tách điều đã quan sát, kỹ thuật đề xuất và phần chưa biết. Skill đọc Editor version, manifest/lock, renderer thực và capability tool trước khi chọn HLSL, Graph hoặc hybrid. Không tự đổi pipeline/package để chạy tutorial; Graph bắt buộc nhưng thiếu đường authoring đáng tin thì phải ghi gap.

Đầu ra gồm source/dependencies, material và hướng dẫn tham số, captures/checks trong phạm vi, provenance khi dùng code ngoài và giới hạn chưa xác minh. Chỉ đổi màu/texture material đi theo material owner; cả effect có timeline/pooling đi theo VFX authoring. Plan-only không author asset; no-build vẫn được giữ.

Kiểm chứng phải tách import/save/reopen, shader diagnostics, hình ảnh, parameter ownership, player variants và device performance. C# compile hoặc catalog validation không thay render/build/device evidence. Xem [receipt triển khai](evidence/unity-shader-validation.json) để biết nhánh đã chạy thực tế và [plan](plans/UNITY_SHADER_SKILL_PLAN.vi.md) cho pilot/eval dự kiến.

Nguồn tham khảo GitHub được pin trong [research snapshot](research/unity-shader-skill-20261103.json); chúng là nguồn thiết kế workflow, không phải danh sách package đã chứng minh tương thích. Không có shader/code hoặc artwork của repo ngoài được phân phối vào skill này.
