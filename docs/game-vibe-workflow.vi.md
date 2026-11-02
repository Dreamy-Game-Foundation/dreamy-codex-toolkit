# Làm game bằng Game Vibe Workflow

Skill `game-vibe-workflow` điều phối theo phạm vi được yêu cầu, từ game hoàn chỉnh đến một lát cắt chơi được: chốt trải nghiệm → chứng minh một mẫu integration → mở rộng từng đợt → review/polish → kiểm chứng đầu ra trong scope → bàn giao. Không dùng một pilot để thay yêu cầu clone toàn game.

Với yêu cầu **clone hoàn thiện y hệt toàn game**, dùng nhánh [exact-clone](../skills/gameplay/game-vibe-workflow/references/exact-clone.md): chuẩn bị brief toàn trải nghiệm trước khi code feature. Không tự biến yêu cầu thành slice offline hoặc vài màn dễ. Pilot là bước kiểm integration trong scope đầy đủ, không thay scope.

## Tìm ảnh/video và ghi plan theo chức năng

Skill yêu cầu nghiên cứu theo từng nhóm chức năng/trạng thái: gameplay, launch/loading, onboarding, Home/menu, pause/settings, result/retry, progression và các chức năng shop/lives/rank/event/daily nếu thực sự có trong game đích. Tìm ảnh bằng tên game + chức năng + trạng thái; tìm video gameplay/walkthrough/full-session và đoạn vào → thao tác → kết quả khi có. Ghi phiên bản/platform, URL/author, trạng thái, timestamp/range và mở ảnh hoặc xem đoạn video trước khi coi là bằng chứng.

Nếu project chưa có quy ước, đầu ra mặc định là:

```text
Docs/ClonePlan/
  PLAN.md              # liệt kê toàn bộ chức năng/trạng thái trong scope, link plan, milestone và gap
  references.json      # nguồn, ảnh/frame/video, truy vấn và coverage từng trạng thái
  features/Fxxx-*.md   # plan theo nhóm chức năng: behavior, refs, tasks, dependencies và acceptance
  media/               # ảnh/frame đã chọn; video chỉ lưu khi cần và được phép
```

Tái sử dụng plan có sẵn như `Docs/ExactClone` thay vì tạo hai nguồn sự thật. Dùng các mẫu [plan index](../skills/gameplay/game-vibe-workflow/assets/clone-plan-index.md), [feature plan](../skills/gameplay/game-vibe-workflow/assets/clone-feature-plan.md) và [reference manifest](../skills/gameplay/game-vibe-workflow/assets/clone-reference-manifest.json). Mỗi chức năng bắt buộc phải có plan/link nguồn hoặc gap rõ; phải liệt kê cả chức năng chưa triển khai. Với slice nhỏ có thể nhóm các chức năng liên quan trong một file.

Video tìm được nhưng không phát/xem được vẫn là nguồn chưa kiểm chứng; giữ URL và nguyên nhân. Không tìm thấy ảnh/video không chứng minh chức năng không tồn tại. Tách nguồn khác version, marketing, thumbnail và ảnh clone khỏi runtime game gốc; motion/timing còn thiếu thì ghi unknown. Các ràng buộc no-web, plan-only và no-build vẫn được giữ nguyên.

## Clone y hệt: chuẩn bị đủ trước khi làm

Mọi clone dùng [clone-research](../skills/gameplay/game-vibe-workflow/references/clone-research.md) để tìm ảnh/video theo từng chức năng và ghi thành plan trước khi code parity. Whole-game giữ toàn bộ chức năng đã phát hiện; slice giữ đúng phạm vi được yêu cầu.

1. Xác định đúng game/version/platform và đọc project/source metadata. Lập graph entry/loading/onboarding/Home/menu/gameplay/result/shop/lives/rank/pass/event/settings/profile/save và mọi chức năng có trong target. Ghi từng control, precondition, effect, exit, locked/loading/error/empty/pending/cancel/claim/expired.
2. Tìm trên mạng cả gameplay lẫn frontend/meta: official help/store/version, tìm ảnh theo tên game + chức năng/trạng thái, tìm video full-session/first-hour và walkthrough các màn shop/rank/settings nếu áp dụng. Chụp/tải screenshot/frame gốc, ghi URL/author/version/state/aspect/timestamp và mở ảnh kiểm tra; xem đoạn video liên quan nếu truy cập được. Tách marketing, montage, ảnh clone và ảnh game khác; URL/thumbnail video không chứng minh đã xem hành vi.
3. Sau đục asset, tạo JSON link **từng file**, kể cả file chưa dùng: ID/path/URI/type/bytes/GUID/source object/hash receipt hoặc chưa đọc. Validate link và map từng màn đến source asset → output/meta GUID → component/prefab → capture. Có art phù hợp thì nối và hoàn thiện chức năng, không giữ placeholder vì tiện.
4. Tạo cặp ảnh gốc/clone, ghi sai lệch cụ thể và sửa rồi chụp lại. Khác board/version chỉ so layout trong phạm vi cho phép. Test luật xanh không chứng minh giống hình/feel hoặc full campaign đã giải được.
5. Nếu cần Unity/MCP/Game View tương tác thay batch, **báo trước** lý do, project/scene, trạng thái Editor/bridge cần có và việc sẽ làm; không mặc định package MCP đã cài là kết nối được. Đây là phối hợp công việc, không xin lại quyền sửa reversible đã có. Không build khi owner đã dừng build.

Đã áp dụng trên Pixel Flow trước khi đưa thay đổi này vào toolkit:65 màn/luồng,24.588 file asset/77.970 source object,8 cặp ảnh so; các gap version/screenshot được giữ nguyên. Kết quả cho thấy Home/shop/fail cũ khác đáng kể và còn thiếu ảnh đúng state cho nhiều mục; **không kết luận đã clone y hệt**. Toolkit chỉ lưu [summary không chứa asset](evidence/exact-clone-pixelflow-preparation.json); game files/captures nằm trong workspace game.

Thiếu provider billing/rank/account không cho phép loại chức năng khỏi brief hoặc báo thành công giả. Làm phần client/domain/adapter đã được yêu cầu; nêu dependency và giữ gate live-service chưa xác nhận. Chỉ công bố full clone khi graph được hoàn thiện và bằng chứng phù hợp đã có.

Skill thuộc `unity-core`, nên được phân phối cùng các preset Unity/Dreamy có module này, gồm preset mặc định `dreamy-project`. Nó có thể chạy độc lập với REA. Phần cốt lõi phân biệt clone cơ chế/game mới với AI-gen/asset sẵn/procedural/hybrid; engine khác và 2D là các nhánh đề xuất, chưa có chứng minh production từ case nguồn.

Nguồn: [skill](../skills/gameplay/game-vibe-workflow/SKILL.md), [workflow](../skills/gameplay/game-vibe-workflow/references/workflow.md), [asset routes](../skills/gameplay/game-vibe-workflow/references/asset-routing.md), [templates](../skills/gameplay/game-vibe-workflow/references/templates.md), [provenance](../skills/gameplay/game-vibe-workflow/references/sources.md).

## Biến yêu cầu ngắn thành đầu vào đủ để làm game

Với game mới, clone hoặc project còn thiếu đặc tả, đọc [input-pack](../skills/gameplay/game-vibe-workflow/references/input-pack.md) trước khi triển khai feature. Dùng [task-spec](../skills/gameplay/game-vibe-workflow/assets/task-spec.md) để mở rộng yêu cầu thành tài liệu riêng của game; có thể gộp vào tài liệu đang có, không cần tạo nhiều file cho đủ mẫu.

Đầu vào cần nêu hành trình người chơi, từng màn hình/trạng thái/input, luật và thông số observed/measured/estimated/unknown, hướng hình ảnh/âm thanh, vai trò từng reference, nhóm asset và đường vào runtime, P0/P1/P2 có cách kiểm tra, budget/timebox và chính sách build. Reference marketing, runtime gốc, concept đã duyệt và capture của clone có vai trò khác nhau. Chọn một lát cắt thử không đồng nghĩa chủ dự án đã chốt đó là toàn bộ phạm vi clone.

Phản hồi từ checkpoint Pixel Flow cho thấy skill có được đọc nhưng M0 và review fidelity chưa được áp dụng đủ. Đã bổ sung intake/template và các case đặc tả để tránh đi từ brief mỏng thẳng đến mở rộng code. Test luật xanh không chứng minh hình ảnh, cảm giác chơi hay âm thanh giống game gốc. Sửa tài liệu không tự hoàn thành những kiểm chứng đó.

Nếu chủ dự án nói không build, tiếp tục bằng source/Editor và ghi player gate là deferred-by-owner. Không build lại để hoàn tất checklist. Không tự sao chép budget, hook hoặc quy tắc làm việc riêng của Oldcraft sang game mới.

Prompt để khởi đầu bằng bộ đầu vào chi tiết:

```text
Dùng $game-vibe-workflow cho game và reference tôi cung cấp.
Trước khi code feature, tạo/cập nhật task, behavior matrix hoặc interaction
hypothesis, style/reference roles, asset roles, acceptance và backlog.
Tách yêu cầu đã xác nhận, đề xuất của agent và điều chưa biết; không tự
thu hẹp toàn bộ clone thành một pilot. Tận dụng tài liệu/trạng thái hiện có.
REA mode auto; asset route theo nguồn có sẵn và gap thực tế.
Chính sách build: [Editor-only / build khi cần / target cụ thể].
Sau intake, chứng minh một mẫu đại diện rồi mở rộng theo tiêu chí đã ghi.
```

## Dùng hoặc bỏ REA theo yêu cầu

REA giúp điều tra một hành vi cụ thể từ artifact/bản build khi cần bằng chứng mà source hoặc quan sát hiện có chưa trả lời được. Nó không tự tạo game, asset hay thay thế Unity MCP.

| Chế độ | Cách vận hành |
|---|---|
| `off` | Không gọi, kiểm tra hay setup REA. Dùng source/reference/quan sát hiện có. |
| `auto` — mặc định | Chỉ dùng REA cho câu hỏi thực sự cần artifact/runtime evidence. Nếu thiếu công cụ, tiếp tục phần làm game độc lập và ghi điều chưa biết. |
| `required` | Yêu cầu phải có kết quả REA. Thiếu tool/provider/target thì phần điều tra chưa đạt; không gọi kết quả độc lập là đã hoàn thành yêu cầu đó. |

Repo có source đầy đủ thường đọc source và chạy test bình thường. Game mới theo thiết kế riêng thường không cần REA. Không tự tải một game khác hoặc cài provider chỉ vì chọn `auto`.

Adapter tại [references/rea.md](../skills/gameplay/game-vibe-workflow/references/rea.md) đã đối chiếu upstream commit `96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9`. Nó phân biệt .NET/Mono, IL2CPP metadata, native, JS/Electron và giới hạn host/provider. Metadata, pseudocode hoặc một reconstruction check không chứng minh gameplay tương đương. Công cụ/schema thực tế phải được kiểm tra lúc dùng.

Toolkit không thêm package REA, submodule, runtime dependency hay MCP registration. Việc cập nhật/cài skill không chạy REA setup và không đổi cấu hình Codex toàn cục. Nếu sau này cần setup REA, thực hiện trong phạm vi yêu cầu với preview thay đổi cấu hình; hướng dẫn có trong adapter.

## Prompt mẫu

Nếu cần đục asset từ gói game đã chọn, dùng thêm [`game-asset-extraction`](game-asset-extraction.vi.md). Nhánh này giữ nguồn, thử mẫu, xuất asset và receipt; hoạt động độc lập với REA. Sau đó đưa asset qua kiểm tra import/gameplay của workflow. Brief clone đơn thuần không tự yêu cầu extraction.

Game mới, dùng asset có sẵn:

```text
Use $game-vibe-workflow. Làm một arena survival nhỏ trong project này.
REA mode: off. Dùng asset sẵn tôi đã cung cấp, thêm procedural khi cần.
P0: di chuyển, né, một đợt quái, một attack, thắng/thua và restart.
Chứng minh một mẫu chơi được và build sớm trước khi mở rộng nội dung.
```

Clone cơ chế, dùng AI/hybrid, REA nếu cần:

```text
Use $game-vibe-workflow để làm slice theo reference và artifact tôi cung cấp.
REA mode: auto. Đầu tiên lập bảng hành vi/thông số measured-estimated-unknown.
Chỉ điều tra artifact nếu source/quan sát chưa giải thích được một cơ chế P0.
Asset route: AI cho nhân vật chính, pack sẵn cho môi trường/SFX, procedural layout.
Giữ receipt và budget; kiểm chứng một mẫu trong engine/build trước batch.
```

Yêu cầu REA rõ ràng:

```text
Use $game-vibe-workflow. REA mode: required.
Điều tra cooldown của attack trong artifact ở đường dẫn tôi chọn.
Ghi target hash, tool/version, evidence IDs, quan sát, suy luận và điều chưa biết.
Sau đó triển khai cơ chế cho game này và test cả hành vi lẫn luồng chơi.
Nếu REA không sẵn, ghi phần điều tra là blocked/not-run; vẫn làm phần độc lập.
```

Resume:

```text
Use $game-vibe-workflow để tiếp tục từ state và revision thực tế.
Giữ REA mode và target đã chọn; kiểm tra job/process còn chạy trước khi retry.
Chạy smoke/gold path phù hợp, tiếp tục next action và giữ feature freeze.
```

Các prompt trên là ví dụ dùng skill, không phải kết quả model/runtime đã chạy. Người dùng có thể nêu rõ số liệu, thiết bị, deadline và phạm vi thay đổi ngay trong brief; skill tận dụng quyết định đã có thay vì hỏi lại.

## Tái sử dụng Dreamy trước khi tự viết

Với project Dreamy, đọc [quy trình reuse](../skills/gameplay/game-vibe-workflow/references/dreamy-reuse.md) trước khi thêm hạ tầng/UI. Đọc README template/Bootstrap/package và `_Feature`, đối chiếu source/manifest/lock/prefab/address thực tế; README có thể cũ. Thứ tự tìm: project/template → `_Feature` đã import → package đang cài → repo Dreamy-Game-Foundation. Không tìm được capability phù hợp mới viết phần riêng và ghi rõ gap/owner.

Ưu tiên installer/service/presenter có sẵn, prefab variant và adapter nhỏ. Dùng một composition root, một nguồn wallet/save/settings; mở panel qua PanelManager với presenter factory, asset/address và lifecycle rõ ràng; gắn UITweenPlayer/effect/stagger và Feedback component phù hợp. Chỉ cài package hoặc gọi một interface không được coi là đã tái sử dụng. Giữ dữ liệu cũ và giao dịch nguyên tử, loại bỏ đường hạ tầng trùng sau khi chuyển đổi.

Docs handoff phải giải thích cách install/load/open panel, chỉnh prefab/config/tween và cập nhật package/sample. Kiểm tra compile, save migration, single-owner/cleanup, reopen/cancel/address failure, transaction/restore và luồng người chơi. Editor pass không đủ để gọi là ship-ready khi build/device/SDK/store gate còn hoãn. Fake IAP được phép khi owner yêu cầu, chỉ ở gateway và phải ghi rõ phạm vi bằng chứng.

## Trạng thái kiểm chứng

Skill được đăng ký như `experimental`, profile `compact-workflow`. Tài liệu nguồn Oldcraft đã đọc theo dạng text; asset nặng không được mở trong lần tổng hợp. Upstream REA được nghiên cứu theo commit; không có live REA/provider/Unity test trong việc đóng gói này.

Catalog eval chứa positive, negative và conflict cases cho mode selection, resume, source-vs-binary routing, asset pilot và giới hạn bằng chứng. Validator/catalog tests chỉ kiểm tra cấu trúc. Maturity không tự tăng thành đã chứng minh hành vi model hay clone game thành công.


### Gi? lu?ng scene c?a template

Khi d?ng Dreamy template, ??c bootstrap README v? source `GameInit`, `GameInstaller`, `SceneLoader`, scene Init/Bootstrap v? Main tr??c khi t?ch h?p. Gi? Init ? Ready ? SceneLoader/loading ? Main, scene GUID, th? t? build settings v? Editor Play entry. Installer t?n t?i ? Init, controller/UI ? Main d?ng service ?? c?i; kh?ng r?t th?nh m?t scene ho?c gi? tham chi?u controller xuy?n scene. Test ph?i b?t ??u t? Init v? ch?ng minh ??n Main v?i ??ng m?t installer. Ch? thay lu?ng n?y khi ch? d? ?n y?u c?u r?.
