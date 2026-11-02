# Plan: ảnh kết quả cho tác vụ cần kiểm tra visual

Ngày cập nhật: **29/10/2026**. Toolkit canonical: **0.1.0-alpha.4**, alpha. Trạng thái: **plan**, chưa tạo/cài skill hoặc Git hooks.

**Phạm vi người dùng đã chốt:** chỉ cần xem **ảnh** của những tác vụ cần kiểm tra visual, ví dụ thao tác Unity qua MCP. Skill `visual-review` dùng tool capture và file preview sẵn có của editor/browser/device/client; Orca Mobile là một ví dụ; ảnh tạm được Git ignore và dọn sau commit thành công.

## 1. Khi nào dùng

Khi kết quả cần được nhìn trực tiếp: chỉnh UI/layout, prefab hiển thị, camera framing, material, ánh sáng hoặc bố cục scene. Cần screenshot đúng đối tượng/khu vực đang kiểm tra.

Không chụp cho mọi task. Sửa logic C#, tài liệu, cấu hình hoặc chạy test thuần túy không cần ảnh nếu không có tiêu chí visual. Việc dùng Unity MCP để đọc Console/hierarchy cũng không tự tạo nhu cầu screenshot.

Ví dụ:

> Sửa layout popup shop qua Unity MCP và cho tôi xem ảnh kết quả trên Orca.

Agent sửa trong phạm vi đã yêu cầu, kiểm tra kết quả, rồi trả **một ảnh sau sửa** và caption ngắn. Chỉ thêm ảnh trước/sau hoặc vài trạng thái khi chúng giúp đánh giá thay đổi. Không làm video, streaming, dashboard, cloud upload hay public share trong skill này.

## 2. Luồng làm việc

1. Xác định task có tiêu chí visual nào và view/trạng thái cần nhìn.
2. Dùng tool Unity MCP/editor bridge đang kết nối để inspect đúng project, scene/prefab và target. Trước API claim, kiểm tra manifest/lock và source/version tương ứng.
3. Thực hiện thay đổi được yêu cầu, save/refresh/compile/read Console khi liên quan.
4. Chụp ảnh thật từ Game View, Scene View hoặc preview phù hợp bằng capability **đã xác minh** của bridge. Chọn view theo mục tiêu; ảnh hierarchy/JSON state không thay screenshot của kết quả hiển thị.
5. Lưu ảnh tạm vào worktree, đưa đường dẫn và caption trong phản hồi để mở qua Orca Mobile.
6. Sau commit thành công chứa đúng thay đổi của task, dọn ảnh tạm do skill sở hữu.

Ảnh dùng để đánh giá hình thức; compile/test vẫn báo riêng. Không dùng ảnh AI tạo để đại diện cho kết quả Editor. Không tự sửa camera/scene hoặc vào Play Mode chỉ để tạo ảnh nếu thao tác đó vượt phạm vi task. Nếu cần đổi trạng thái Editor để capture, dùng workflow Unity hiện có và bảo toàn trạng thái không thuộc task.

Thiếu MCP hoặc capability capture thì báo đúng phần chưa kiểm chứng; không tự cài package, dựng một capture framework mới hay nói đã có ảnh khi chỉ nhận được state snapshot. Nếu tool trả ảnh trong chat nhưng không hỗ trợ xuất file, phải kiểm tra đường xuất được hỗ trợ trước khi hứa ảnh sẽ mở được trên điện thoại.

## 3. Kết quả gửi cho người dùng

Phản hồi ngắn gồm:

- Đã thay đổi gì và ảnh đang cho thấy view/trạng thái nào.
- Một ảnh PNG/JPEG hoặc đường dẫn mở ảnh trong đúng worktree Orca.
- Kết quả compile/Console/test liên quan, hoặc exact limitation.

Mặc định một ảnh sau sửa; có thể thêm before/after khi cần so sánh hoặc vài ảnh cho các trạng thái khác nhau. Crop đúng vùng cần nhìn nhưng giữ đủ context để đánh giá. Không áp quota ảnh cứng làm bỏ sót trạng thái cần kiểm tra; tối ưu dung lượng theo khả năng đọc chữ trên điện thoại.

Không khẳng định ảnh đã hiển thị trên điện thoại chỉ từ việc file tồn tại trên host. Sau cleanup, link local có thể không còn mở được; thông báo ảnh là tạm ngay khi gửi.

## 4. Lưu ảnh và giữ Git nhẹ

Layout dự kiến:

```text
skills/production/visual-review/
  SKILL.md
  scripts/visual-review.mjs
  references/unity-capture.md
  references/orca-and-cleanup.md

<consumer-worktree>/.dreamy/visual-review/
  <task-id>/<run-id>/
    manifest.json
    after.png
    before.png       # chỉ khi cần so sánh
  pending/<worktree-key>.json
  receipts/<run-id>.json
```

Ảnh nằm ngoài `Assets/` để tránh Unity import và sinh `.meta`. Root này được ignore **trước khi ghi ảnh**; helper kiểm tra bằng Git thực tế, không chỉ thấy một dòng trong `.gitignore`. Setup chỉ thêm rule đúng root nếu cần, giữ nguyên các ignore rules khác. Không ignore toàn bộ `*.png` vì đó có thể là asset sản phẩm.

Manifest gọn ghi owner, task/run, repo/worktree identity, source snapshot liên quan, view/trạng thái capture và path/hash của ảnh. Với before/after, ghi source trước và sau riêng; binding cleanup dùng kết quả sau sửa. Không lưu transcript hoặc screenshot toàn desktop khi không cần.

Chỉ quản lý ảnh do skill tạo. Ảnh sản phẩm, baseline visual test đã tracked, user attachments và verification evidence hiện có không thuộc cleanup scope. Không tự untrack file hoặc sửa Git history.

## 5. Dọn sau commit

Mục tiêu có hai phần: ảnh không vào commit ngay từ đầu để Git nhẹ; sau commit thành công mới xóa bản tạm để host nhẹ.

- Pre-commit kiểm tra ảnh managed không bị staged và chuẩn bị cleanup ticket; **không xóa ảnh ở bước này**.
- Ticket gắn worktree, base HEAD, staged tree và run/source snapshot. Partial staging hoặc commit không liên quan không được dọn ảnh của task khác.
- Post-commit chỉ dọn khi commit mới khớp ticket và ảnh vẫn đúng hash/ownership. Commit thất bại, ảnh bị sửa hoặc không xác minh được thì giữ nguyên.
- Chỉ xóa regular files được manifest liệt kê trong root owned; từ chối symlink/junction/path traversal và không quét toàn bộ `.dreamy/` hay `artifacts/`.
- Giữ receipt nhỏ sau cleanup; thao tác lặp lại phải idempotent. Cleanup lỗi không được báo ngược thành commit thất bại.

Inspect hook hiện có và `core.hooksPath` trước tích hợp; giữ nguyên Husky/Lefthook/pre-commit hoặc hook của người dùng. Git hooks khác với Codex lifecycle hooks. Không cài hook chỉ vì skill được agent chọn. Nếu môi trường không hỗ trợ hook, dùng helper cleanup tường minh sau commit với cùng kiểm tra; ảnh vẫn không vào Git nhờ ignore.

MVP tập trung normal commit. Merge/amend/rebase hoặc tool bypass hooks chưa được kiểm chứng thì giữ ảnh và báo cleanup chưa chạy. Không dùng `git clean -fdx` hoặc lệnh xóa wildcard.

## 6. Cách dùng Orca và nguồn đã nghiên cứu

Ưu tiên paired workspace/file preview sẵn có của Orca. Phải thử ảnh trong thư mục dot/ignored trên đúng điện thoại; nếu không truy cập được, kiểm tra đường dẫn trực tiếp hoặc root ignored không-dot `artifacts/visual-review/`. Chọn một mode đã tested, không tạo nhiều bản ảnh mặc định.

Các nguồn GitHub từ lượt nghiên cứu trước vẫn được giữ trong [research snapshot](../evidence/orca-visual-review-research-20261029.json). Snapshot có đọc cả video/media để khảo sát ban đầu; **những phần đó không còn thuộc phạm vi triển khai** sau yêu cầu thu gọn.

| Nguồn đã pin | Bài học giữ lại cho skill ảnh |
|---|---|
| [Orca source](https://github.com/stablyai/orca/tree/1263370049f5b32fcf61a17987a2fc9f871ad2df) | File preview, path resolution, ignored-file listing và commit integration; cần acceptance trên bản đang dùng |
| [Playwright screenshots](https://github.com/microsoft/playwright/blob/f33f0b751be0dd559d86c1ed27ca8baa5f9cb2b2/docs/src/screenshots.md) | Screenshot là output có đường dẫn riêng; chỉ học cách quản lý output, chưa xây adapter web trong MVP |
| [Playwright ignore rules](https://github.com/microsoft/playwright/blob/f33f0b751be0dd559d86c1ed27ca8baa5f9cb2b2/.gitignore) | Generated results được tách khỏi source |
| [Git hook docs](https://git-scm.com/docs/githooks) | Cleanup đặt sau commit thành công; không đổi kết quả commit |

Guide Orca local đã đọc qua `orca-ide skills get orca-cli`; khi triển khai phải resolve và đọc guide đúng phiên bản lại nếu môi trường thay đổi. Runtime ở lượt nghiên cứu trước chưa reachable; chưa có mobile screenshot acceptance. Không cần public artifact service để đạt mục tiêu này.

## 7. Các bước triển khai

| Bước | Công việc | Nghiệm thu |
|---|---|---|
| 1 — Spike ảnh thật | Dùng Unity consumer có MCP, chụp một kết quả visual và lưu file ignored | Mở ảnh từ Orca Mobile, đúng project/view, chữ và chi tiết đọc được |
| 2 — Skill gọn | Viết trigger visual, workflow capture/delivery; helper quản lý path/manifest | Task visual có ảnh; task code/docs thuần không chụp; capability thiếu báo đúng |
| 3 — Cleanup | Tích hợp owned Git hooks/helper và ticket theo worktree | Commit thành công dọn đúng ảnh; commit fail/partial staging/task khác giữ ảnh |
| 4 — Toolkit | Đăng ký catalog/owner/evals, review module/preset impact, chạy validation và package smoke liên quan | Cài/update/uninstall bảo toàn dữ liệu; không nâng maturity khi thiếu acceptance |

Không xây capture adapter tổng quát trước spike. Dùng capability Unity MCP đã có; chỉ thêm helper cho phần lưu/xem/dọn cần lặp lại. Entrypoint theo `compact-workflow`, chi tiết có điều kiện nằm trong references.

## 8. Các ca kiểm tra tối thiểu

- Sửa UI qua Unity MCP cần visual → ảnh thật sau sửa; before/after khi có giá trị.
- Dùng MCP chỉ để đọc Console, hoặc sửa logic C#/docs → không chụp ảnh vô ích.
- MCP trỏ sai project, view chưa render, tool không xuất ảnh/file → không tạo evidence giả.
- Ảnh ở ignored root mở được trên Orca Mobile; không xuất hiện trong staged tree sau `git add .`.
- Commit fail giữ ảnh; successful matching commit dọn ảnh; partial staging và hai worktree/task không xóa lẫn nhau.
- Existing hooks, ảnh tracked và file người dùng chỉnh không bị xóa/ghi đè.

Tests Node/Git chứng minh phần quản lý file/cleanup; ảnh từ Unity và trải nghiệm Orca Mobile phải có thử nghiệm thật riêng. Trước khi đánh dấu phase hoàn tất, chạy `npm test` và relevant checks; ghi exact reason nếu check không chạy được.

Plan này thay thế phạm vi ảnh/video trước đó. Chưa tạo skill, cài hook, điều khiển Unity, chụp ảnh, xóa file hay commit trong lượt cập nhật tài liệu này.

## Checkpoint triển khai

Skill đã được triển khai với tên chung `visual-review`, dùng nhiều tool/client; Orca và Unity MCP không phải dependency bắt buộc. Hướng dẫn chính ngắn, chi tiết có điều kiện nằm trong references. Xem [hướng dẫn hiện tại](../visual-review.md). Helper file/Git có test fixture; chưa xác nhận capture/delivery trên Editor và điện thoại thật. Không cài hook ở repository đang làm việc.
