# Clone game với REA và AssetRipper

Skill experimental [`game-clone`](../skills/gameplay/game-clone/SKILL.md) điều phối nghiên cứu game tham chiếu, lấy asset, phân tích rule còn thiếu, tích hợp vào Unity/Dreamy và đối chiếu kết quả. Skill reuse `game-asset-extraction` và `game-vibe-workflow` trong module `unity-core`; không kèm binary, APK hay tài sản game.

## Cách dùng

Chỉ lập kế hoạch từ link tham chiếu:

```text
Use $game-clone. Lập plan clone game tại link này vào project Dreamy hiện tại.
Liệt kê màn hình, gameplay, asset cần lấy và phần cần phân tích bằng REA.
Chưa chạy extraction hoặc sửa gameplay. Nếu chưa có APK thì ghi đúng bước còn thiếu.
```

Triển khai một slice với artifact đã chọn:

```text
Use $game-clone. Dùng APK tại đường dẫn tôi cung cấp và project Unity hiện tại.
Dùng AssetRipper lấy asset và REA xác minh rule di chuyển chưa rõ.
Làm slice một level: kéo block, cửa cùng màu, thắng/thua và restart.
Xuất vào workspace riêng, giữ nguyên source, kiểm tra trên Editor; chưa build player.
```

Clone toàn bộ game:

```text
Use $game-clone để clone toàn bộ game từ XAPK và bản tham chiếu tôi cung cấp.
Dùng cả REA và AssetRipper. Giữ danh sách toàn bộ màn hình/chức năng và content.
Tích hợp asset vào project Dreamy, đối chiếu từng trạng thái, kiểm tra đường vào bình thường.
Pilot chỉ là một mốc; báo riêng những phần cần server hoặc chưa có bằng chứng.
```

Nếu chỉ cần đục asset, dùng [game-asset-extraction](game-asset-extraction.vi.md). Game ý tưởng mới dùng [game-vibe-workflow](game-vibe-workflow.vi.md). Đọc source đầy đủ bằng công cụ code thông thường trước; REA dành cho câu hỏi cần artifact hoặc hành vi phát hành.

## Công cụ và kết quả

REA giữ chế độ `off/auto/required`. Yêu cầu dùng cả hai repo làm kết quả của cả hai thành điều kiện cần; thiếu một công cụ thì phần đó còn blocked/not-run. Người dùng có thể đổi mode sau đó. AssetRipper xuất asset và cấu trúc, REA trả bằng chứng phân tích; dummy script hoặc metadata IL2CPP không chứng minh đã lấy lại code gameplay gốc.

Xuất AssetRipper vào đích mới ngoài source và project đích vì exporter có thể xóa nội dung đích. Catalog nối từng source asset ID tới file export, GUID import, prefab/component và màn hình sử dụng. Mỗi rule có nguồn bằng chứng, giới hạn và acceptance scenario.

Kết quả extraction, REA, import, compile, Play Mode, hiển thị/cảm giác, player build và dịch vụ thật được ghi riêng. Không báo clone hoàn thiện chỉ vì export nhiều file, compile pass hoặc một level chạy được.

## Cài vào Codex

Từ checkout toolkit, dùng installer hiện có theo target/preset đã chọn:

```powershell
node src/cli.js install --target global --preset dreamy-project --dry-run --json
# Dùng install hoặc update phù hợp với trạng thái target sau khi xem preview.
```

`dreamy-project` và `dreamy-production` có module `unity-core`, nên skill đi cùng hai workflow phụ thuộc. Installer đặt skill người dùng tại `.agents/skills` theo cấu hình target; không tự cài REA/AssetRipper hoặc đổi MCP. Skill mới xuất hiện trong catalog Codex ở lượt tiếp theo sau khi cài/cập nhật.

Kiểm thử catalog/lifecycle không thay thế pilot trên game thật. Trạng thái kiểm chứng của lần triển khai này nằm trong [receipt](evidence/game-clone-skill-validation.json); pilot cần artifact được chọn riêng.
