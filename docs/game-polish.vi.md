# Dùng skill game-polish

`$game-polish` là skill experimental cho một tương tác đã tồn tại hoặc một pass trong game Unity. Skill giúp xác định điều gì chưa đạt, chọn thay đổi phù hợp mood và đối chiếu trước/sau. Có trong module `production`, gồm các preset `unity-production`, `dreamy-production`, `unity-full`, `dreamy-full` và `dreamy-package` (preset này cũng có module production). Không cần Dreamy Feedback hoặc thêm package để bắt đầu.

Ví dụ yêu cầu:

```text
Use $game-polish để cải thiện cảm giác đánh của player.
Giữ damage/cooldown và nhịp tấn công nặng hiện tại.
Tìm nguyên nhân từ input → contact → reaction/audio trước khi chỉnh.
Triển khai trong phạm vi combat, so trước/sau ở camera gameplay.
Không thêm package, không build player.
```

```text
Use $game-polish, chỉ audit và lập plan cho core loop và UI/reward.
Game cozy puzzle, ưu tiên feedback mềm và ít motion.
Tách quan sát khỏi giả thuyết, đưa backlog và tiêu chí kiểm chứng.
Không sửa game trong lượt này.
```

Skill bắt đầu bằng intent, baseline và đường input/gameplay/presentation, rồi chọn nhánh control/impact hoặc UI/reward/rhythm cần thiết. Có thể giảm effect hoặc thời gian bị khóa thay vì thêm layer. Thay đổi luật/difficulty phải được nhận diện; animation không quyết định damage/reward. Một pilot là bước kiểm tra hướng, không thay thế phần còn lại của yêu cầu polish toàn game.

Đầu vào hữu ích: project/source, tương tác cần sửa, cảm giác mong muốn, thiết bị/input và reference/clip nếu có. Thiếu clip không chặn review source; thiếu source không cho phép suy ra root cause từ ảnh. Screenshot đủ để nhận xét framing ở một thời điểm, còn timing/motion, audio và cảm giác thiết bị cần evidence tương ứng.

Kết quả gồm thay đổi và lý do, parameter cũ/mới, asset/code liên quan, kết quả kiểm tra cùng giới hạn. Compile pass không chứng minh game hay hơn; đánh giá chủ quan phải ghi người/công cụ đánh giá. Performance/haptics chỉ được xác nhận với bằng chứng phù hợp thiết bị.

Chỉ tạo VFX → dùng `unity-vfx-authoring`; chỉ đổi skin/layout → UI/reskin; chỉ sửa pool/GC → profiling/domain. Skill không tạo runtime manager mới hoặc kéo cả audit vào những task hẹp này.

## Kiểm tra và mức tin cậy

Xem [validation record](evidence/game-polish-validation.json) để biết checks thực tế. Catalog/eval cases là đặc tả; không phải số lần model đã làm đúng. Bộ decision probes có baseline/candidate và split development/holdout:

```bash
node scripts/benchmark.mjs --manifest benchmarks/manifests/game-polish.json --split development --prepare
```

Lệnh chuẩn bị prompt và provenance, không gọi model. Khi chạy semantic evaluation cần adapter được cấu hình và review toàn bộ response/artifact theo `manualReview`; decision-field grader chỉ kiểm tra một phần rất nhỏ. Bộ này là forced-load decision probes, không chứng minh tự động chọn skill, coding quality hay runtime game feel. Không gọi background model hoặc thu transcript tự động.

Pilot Unity/playtest cần game đích và scenario thực. Tình trạng chưa chạy được giữ rõ trong validation record; không lấy installer tests làm chứng nhận chất lượng gameplay. Thiết kế và nguồn nghiên cứu ở [plan](plans/GAME_POLISH_SKILL_PLAN.vi.md).
