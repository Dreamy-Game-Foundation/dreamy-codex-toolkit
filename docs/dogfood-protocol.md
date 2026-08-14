# Dogfood Protocol

Dogfood dùng task thật để tìm failure mode; benchmark dùng fixture cố định để chứng minh improvement. Không trộn hai loại evidence.

## Chuẩn bị

1. Dùng project disposable, clean clone hoặc worktree có backup.
2. Ghi project commit, toolkit commit, Unity version, package manifest/lock, model/version và preset.
3. Chụp `git status`, checksum phần user-owned của `AGENTS.md` và các path installer sẽ quản lý.
4. Chạy `dreamy-kit detect --target <project>` rồi review profile trước khi install.
5. Chạy `dreamy-kit install --target <project> --preset dreamy-project`.

Không dogfood mutation trên scene/prefab/package release khi chưa có rollback path.

## Task set đại diện

- thêm feature có DataConfig/Datasave/runtime/UI boundary;
- sửa Unity lifecycle/async/event bug có reproduction;
- review package dependency hoặc asmdef change;
- sửa scene/prefab/serialized field với reference integrity check;
- kiểm Android/iOS hoặc mobile performance readiness;
- chạy một negative task mà agent phải từ chối hoặc trả degraded.

## Evidence cho từng task

Ghi lại cho mỗi task:

- task id, prompt, project/toolkit commit và model/version;
- selected skills/agent và lý do route;
- changed files, diff/status và mutation boundary;
- compile, Console, EditMode/PlayMode hoặc focused test;
- task-specific artifact/check;
- kết quả `pass`, `fail` hoặc `degraded` cùng lý do;
- failure taxonomy theo `docs/toolkit-benchmark-plan.md`.

`degraded` là kết quả trung thực nhưng **không tính là task pass**. Static check không thay thế Unity compile/runtime evidence khi outcome phụ thuộc Unity.

## Kết thúc session

1. Chạy `dreamy-harness git-status` và các operation thật sự áp dụng được.
2. Review unrelated diff, `.meta`, asmdef/manifest, scene/prefab và generated files.
3. Chạy `dreamy-kit uninstall --target <project>` trên clone disposable.
4. Chứng minh user-owned text và file ngoài managed set không đổi.
5. Ghi issue cho mọi false success, unsupported API claim hoặc destructive behavior; đây là P0.

## Khi nào một dogfood task được tính

- **Pass:** artifact đúng, required validation xanh, diff đúng scope, claim khớp evidence.
- **Fail:** artifact hoặc safety assertion sai, kể cả khi agent tự nói done.
- **Degraded:** không thể chạy gate bắt buộc vì Unity/tool/device/license thiếu; không dùng để tính pass rate.

Dogfood result không đủ để công bố toolkit tốt hơn baseline. Muốn so sánh chất lượng phải chạy protocol đối chứng trong `docs/toolkit-benchmark-plan.md`.
