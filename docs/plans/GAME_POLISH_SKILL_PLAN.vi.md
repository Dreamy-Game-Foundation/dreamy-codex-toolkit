# Plan skill polish game và cải thiện game feel

Ngày nghiên cứu: 2026-11-16. Trạng thái: **đã triển khai skill experimental trong toolkit; structural/distribution checks pass, semantic/Unity/playtest chưa chạy**.

Cập nhật sau khi người dùng đồng ý triển khai: P0–P3 và phần tài liệu P6 đã hoàn tất. P4 mới chuẩn bị development probes; P5 chưa có game đích. Nội dung thiết kế bên dưới giữ làm mốc; xem [validation record](../evidence/game-polish-validation.json) và [usage](../game-polish.vi.md) cho trạng thái thực tế.

Đề xuất `$game-polish`: workflow Unity giúp quan sát một tương tác, tìm nguyên nhân cảm giác chưa đạt, chọn thay đổi có tác động lớn, triển khai trong phạm vi yêu cầu và đối chiếu trước/sau. Hỗ trợ Unity thường; tích hợp Dreamy khi project có package và contract đã xác minh. Không mặc định cần Dreamy Feedback, DOTween, Cinemachine hay một runtime framework mới.

## 1. Căn cứ: điều đã thấy, đề xuất và điều chưa biết

### Observed — đã kiểm tra trong repository

- Baseline HEAD: `eaec7e219321842676cf6d35393a1777dc836225`; working tree sạch khi bắt đầu. `toolkit.json` ghi `0.1.0-alpha.4`, trạng thái alpha.
- Có `dreamy-feedback`, `dreamy-audio`, `unity-vfx-authoring`, `unity-camera`, `unity-animation`, `unity-input-system`, các skill gameplay, `unity-ui`, `unity-ui-reskin`, `unity-profiling` và `visual-review`.
- `dreamy-feedback` chủ yếu giữ routing, ownership và vòng đời feedback. `unity-vfx-authoring` sở hữu sáng tác một hiệu ứng. `game-vibe-workflow` điều phối xây game và đã phân biệt evidence về function, presentation, feel, performance. Chưa thấy skill riêng nối **chẩn đoán cảm giác → ưu tiên → tuning đa kênh → đối chiếu và chơi thử**.
- [Quy ước authoring](../skill-authoring.md) yêu cầu ưu tiên owner hiện có; workflow mới chỉ hợp lý khi có khoảng trống tái sử dụng. Profile `compact-workflow` có các mục Scope / Decisions / Verification / References, mục tiêu 300–800 token và cap 5.000 byte cho entrypoint.
- Module [production](../../modules/production/module.json) chứa visual review và có trong cả `unity-production` lẫn `dreamy-production`. `unity-production` hiện không kéo `unity-gameplay`; không được tạo dependency bắt buộc tới mọi skill gameplay.
- Checkout toolkit không phải project game đích. Manifest/lock fixture `tests/fixtures/unity/vertical-slice/Packages/` chỉ có Test Framework và các dependency của nó; không chứng minh có package feedback/audio/camera trong game tương lai.
- Đã recall lessons bằng CLI với query `game polish game feel skill planning feedback verification`, session hiện tại; kết quả rỗng. Không suy ra đây là bằng chứng chất lượng skill.
- AGENTS.md trỏ `docs/agents/dreamy-workflow.md`, nhưng checkout này không có file đó. Đã đọc [template nguồn](../../templates/dreamy-workflow.md); không tự cài workflow để lập plan.

### Intended contract — đề xuất cho skill

- Skill điều phối chất lượng tương tác; các specialist tiếp tục sở hữu kỹ thuật và API.
- Tôn trọng mood/art direction: crisp, heavy, soft, playful, tense hoặc restrained đều hợp lệ. Giảm chuyển động, âm lượng hay số lớp cũng có thể là polish tốt.
- Bắt đầu với một tương tác đại diện để kiểm tra hướng chỉnh; nếu yêu cầu polish cả game thì sau đó phải đi hết danh sách phạm vi, không coi pilot là hoàn thành toàn bộ.
- Maturity ban đầu `experimental`. Validation cấu trúc, semantic evaluation, Unity pilot và người chơi đánh giá là những gate khác nhau.

### Unknown — cần xác minh khi dùng/triển khai

- Chưa có game, build, video gameplay hay phản hồi người chơi cụ thể. Chưa xác định thể loại, input, thiết bị, FPS, art direction, ngân sách và công cụ capture/audio/haptics thực tế.
- Chưa biết agent với skill có chọn đúng nguyên nhân hoặc tạo kết quả tốt hơn baseline hay không. Cần evaluation và pilot; không hứa tăng retention, doanh thu hay mức độ vui.
- Plan không xác nhận Unity/MCP đang kết nối, không đưa API Dreamy mới và không có kết quả render/playtest/device.

## 2. Nghiên cứu bên ngoài và cách chuyển thành quyết định

Nguồn đọc ngày 2026-11-16. Phân biệt kết luận của nguồn với chính sách thiết kế skill bên dưới; không sao chép toàn bộ tài liệu vào skill.

| Nguồn primary | Điều nguồn hỗ trợ | Quyết định đề xuất cho skill |
| --- | --- | --- |
| [GDC — Juice It or Lose It](https://gdcvault.com/play/1016487/Juice-It-or-Lose), Jonasson & Purho | Trang session giới thiệu cách biến một game đơn giản thành trải nghiệm thỏa mãn hơn bằng các lớp feedback. Chỉ dùng overview đã đọc; chưa xem toàn bộ video trong đợt này. | Có recipe phối hợp nhiều kênh, nhưng từng lớp phải có vai trò và được xem trong gameplay. |
| [Maddy Makes Games — Celeste & Forgiveness](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/) | Coyote time, jump buffering, biến đổi gravity ở đỉnh nhảy và corner correction là các ví dụ điều chỉnh trải nghiệm điều khiển. | Kiểm tra input/response và forgiveness trước khi đề xuất che lỗi bằng VFX. Các kỹ thuật này có điều kiện theo thể loại; không tự đổi luật game. |
| [DiGRA 2018 — Good Game Feel](https://dl.digra.org/index.php/dl/article/view/936/), Hicks và cộng sự | Abstract mô tả framework từ khảo sát 17 developer và phân tích hai game; khái niệm juiciness còn khó định nghĩa. Chưa dùng toàn văn làm bằng chứng cho từng recipe. | Dùng rubric phân tích có tiêu chí; không biến một công thức thị giác thành tiêu chuẩn phổ quát. |
| [CHI 2024 — How does Juicy Game Feedback Motivate?](https://people.csail.mit.edu/dkao/pdf/3613904.3642656.pdf), Kao và cộng sự | Thử nghiệm đăng ký trước với 1.699 người trên một action RPG; feedback khuếch đại trong điều kiện thử có tác động tiêu cực tới một số động lực. Tác giả nhấn mạnh liên kết hành động–kết quả dễ hiểu và phân biệt mức thành công. | Không chấm “nhiều effect hơn” là tốt hơn. Kiểm tra quan hệ nhân quả, độ rõ và khác biệt giữa hit/miss, thường/critical, thành công/thất bại. Không khái quát kết quả một game thành mọi thể loại. |
| [Microsoft XAG 117 — Visual distractions and motion settings](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/117) | Hướng dẫn điều chỉnh camera/chuyển động và các nội dung nhấp nháy/di chuyển có thể gây khó chịu. | Với camera/flash/motion đang thay đổi, kiểm tra setting liên quan và chế độ giảm chuyển động; không tự mở rộng task thành audit accessibility toàn game. |
| [Game Accessibility Guidelines — full list](https://gameaccessibilityguidelines.com/full-list/) | Hướng dẫn có phân biệt tín hiệu âm thanh, volume riêng và phương án cho camera movement. | Khi thêm feedback, giữ thông tin quan trọng đọc được nếu một kênh bị tắt; đánh giá mix và tránh chỉ dựa vào màu, audio hoặc haptics. |

Giới hạn nghiên cứu: chưa thực hiện review có hệ thống toàn bộ literature, chưa có A/B trên game đích. Một PDF FDG 2025 tìm được bị web tool từ chối vì kích thước lớn; không dùng làm căn cứ trong plan này. Tuning values sẽ được thử theo project, không lấy số frame/millisecond từ ví dụ khác làm default toàn cục.

## 3. Phạm vi, trigger và ranh giới

Tên đề xuất: `game-polish`, folder `skills/production/game-polish/`. “Game feel” nằm trong description để tìm đúng nhu cầu; không tạo hai skill `game-feel` và `game-polish` có workflow trùng nhau.

Description dự kiến:

> Polish existing Unity gameplay and UI interactions through game-feel diagnosis, targeted tuning and before/after verification. Use for requests to improve responsiveness, impact, readability or interaction rhythm; route isolated VFX authoring, reskins and performance bugs to their specialists.

Kích hoạt: “polish game này”, “đánh chưa đã tay”, “movement bị floaty”, “reward thiếu satisfying”, “UI bấm thấy cứng”, “review game feel”, hoặc “lên plan polish”. Có thể bắt đầu từ source, bản chơi được hoặc clip; evidence khác nhau dẫn đến mức kết luận khác nhau.

| Chủ thể | Trách nhiệm |
| --- | --- |
| `game-polish` | Mục tiêu cảm giác, baseline, giả thuyết, ưu tiên, phối hợp kênh, thử nghiệm, quyết định giữ/bỏ và bàn giao |
| Input / movement / combat / gameplay owners | Xử lý input, hit detection, damage, collision, movement, cooldown; mọi thay đổi luật hoặc difficulty phải được nhận diện rõ |
| `dreamy-feedback` / `dreamy-audio` nếu có | Tích hợp package đã xác minh; route, playback, settings và cleanup |
| `unity-vfx-authoring`, animation, camera, UI specialists | Author/tune asset và hành vi tương ứng, không nhận toàn bộ orchestration |
| `unity-ui-reskin` | Đổi skin/layout/font khi đó là yêu cầu chính; polish chỉ mở nhánh UI motion/interaction cần thiết |
| `visual-review` | Capture và trình bày hình ảnh thật; screenshot không chứng minh motion, audio hay cảm giác cầm chơi |
| Profiling / mobile specialists | Bằng chứng frame time, allocation, concurrency và thiết bị khi có claim tương ứng |
| `game-vibe-workflow` | Xây game hoặc triển khai feature graph; có thể gọi polish ở milestone phù hợp khi được cài |

Near misses: chỉ tạo hit VFX → VFX authoring; chỉ sửa NullReference hoặc pool leak → debug domain; chỉ làm đẹp màn menu → UI/reskin; chỉ tối ưu FPS → profiling; thiết kế game mới → game-vibe; ảnh minh họa tĩnh → image/vector workflow. Không bắt skill mới tham gia mọi thay đổi nhìn thấy được.

## 4. Quy trình đề xuất khi sử dụng skill

### A. Chốt intent và baseline vừa đủ

- Xác định `audit/plan` hay `implement`, toàn game hay một slice; dùng dữ liệu project trước khi hỏi. Từ ngữ “polish” không tự cho phép đổi cơ chế, economy hay art direction.
- Đọc instructions, git state, code owner, Unity version, manifest/lock và đường input/event/feedback liên quan. Xác định asset, service, time, pool và cancellation owner.
- Ghi mood, động từ chính, target input/device, FPS mục tiêu nếu có; hỏi hẹp nếu lựa chọn làm đổi hướng đáng kể. Không ép người dùng điền questionnaire dài.
- Tái hiện tình huống cụ thể: vd. tap fire → projectile/hit → enemy reaction → reward; hoặc drag tile → valid/invalid drop → resolve → UI ready. Ghi camera, quality, resolution, scenario và revision để so trước/sau.
- Nếu chỉ có video: nêu điều thấy được và giả thuyết riêng. Không suy ra input latency thật, lực haptics hoặc root cause của code từ clip.

### B. Chẩn đoán theo chuỗi hành động

Mô hình: **ý định → input → phản hồi điều khiển → tiếp xúc/kết quả → biểu đạt → hồi phục/sẵn sàng hành động tiếp**.

| Nhánh | Câu hỏi quyết định | Các lựa chọn có điều kiện |
| --- | --- | --- |
| Responsiveness / control | Input bị mất, phản hồi trễ, trượt hay khó dừng ở đâu? | Input buffering, acceleration/deceleration, dead zone, forgiveness, drag thresholds; phân biệt với animation cố ý nặng |
| Timing / physicality | Anticipation, contact, follow-through, recovery có khớp vai trò và quyền điều khiển? | Easing, squash/stretch, recoil, landing, animation blending; không kéo dài wind-up chỉ để “đẹp” |
| Impact / feedback | Người chơi biết mình chạm/trúng/thất bại vào lúc nào? | Hit reaction, flash, âm transient, haptics, micro camera impulse, hit-stop theo khả năng project |
| Readability / camera | Có thấy nhân vật, hướng hành động, nguy hiểm và kết quả không? | Framing, follow/look-ahead, contrast/hierarchy, giảm occlusion, bớt effect đồng thời |
| UI / reward | Press, pending, confirmed, rejected và ready có phân biệt rõ? | Press/release motion, progress feedback, count-up/fly, transitions, skip/cancel; grant reward độc lập animation |
| Rhythm / continuity | Loop bị đứt bởi chờ, lặp hoặc thiếu chuyển tiếp ở đâu? | Rút dead time, stagger, chuyển trạng thái; giữ nhịp và khoảng lặng phù hợp genre |

Không bắt mọi task dùng đủ sáu nhánh. Phân biệt lỗi nền tảng cần sửa với lựa chọn thẩm mỹ cần thử. Ưu tiên mất input, sai contact, thông tin bị che và tương tác bị khóa trước chi tiết trang trí. Không mặc định “snappy” cho horror/heavy simulation hoặc shake cho cozy puzzle.

### C. Lập backlog theo bằng chứng

Mỗi mục có: `observation`, `evidence`, `hypothesis`, `proposedChange`, `owner`, `scope`, `expectedBenefit`, `cost`, `risk`, `acceptance`, `verification`, `status`.

Ưu tiên định tính theo tần suất gặp × mức ảnh hưởng tới động từ chính × độ chắc của bằng chứng, rồi cân nhắc chi phí/rủi ro. Không tạo điểm số chính xác giả khi chưa có dữ liệu. Lỗi rõ là P0; tuning chính P1; embellishment P2. Với yêu cầu audit, kết quả có thể là backlog và experiment plan, chưa sửa project.

Ví dụ: **Observed:** reward đã cộng nhưng modal vẫn khóa input đến khi coin cuối bay xong. **Hypothesis:** thời gian bị khóa gây cảm giác chậm. **Experiment:** giữ feedback ngắn ở thời điểm xác nhận, cho skip phần trang trí, mở tương tác tiếp ở mốc phù hợp. **Invariant:** reward đúng một lần; skip/reopen/pause không cộng lại; không tự đổi giá trị thưởng. Đây là ví dụ minh họa, không phải failure đã quan sát ở một game thật.

### D. Triển khai và tinh chỉnh có giới hạn

- Chọn một nhóm nhỏ thay đổi có quan hệ nhân quả; đo/xem/chơi lại rồi giữ hoặc bỏ. Không chỉnh đồng thời mọi thông số rồi mất dấu nguyên nhân.
- Reuse config, tween, audio, camera, VFX và feedback owner đang có. Expose ít tham số hữu ích, lưu giá trị cũ/mới cùng đơn vị; không xây “universal juice manager” cho một task nhỏ.
- Mỗi recipe nêu mục đích, trigger, timeline, kênh, parameter cần tune, cleanup và failure modes; giá trị ví dụ phải ghi là điểm thử, không phải chuẩn.
- Hit-stop/slow motion cần xác định clock và phạm vi: local presentation hay global simulation; pause, UI, input buffer, physics, audio và multiplayer có thể chịu ảnh hưởng. Ưu tiên cơ chế đã có; không tự dùng global `Time.timeScale` để giải mọi hit.
- Tránh scale collider theo visual squash nếu không có chủ ý gameplay. Camera shake không thay thế aim/hit validation. SFX pitch/volume variation cần giữ phân biệt semantic và không làm clipping/voice spam.
- Animation không sở hữu reward/damage authority. Trong mạng/client prediction, tách phản hồi input dự đoán khỏi xác nhận authoritative; không giả thưởng/trúng trước khi có kết quả phù hợp.
- Tweens/async phải xử lý cancel, disable, scene unload, pool reuse và callback cũ. Camera/audio/haptics có concurrency/throttle phù hợp; hiệu ứng nhỏ cần vẫn rõ khi chạy dày.
- Nếu yêu cầu polish toàn game: duy trì coverage theo core loop, UI, win/lose/retry, transitions và các trạng thái đã thống nhất; hoàn thiện coverage sau khi hướng pilot đạt.

### E. Đối chiếu và dừng đúng phạm vi

- Giữ điều kiện baseline/candidate tương đương. Xem normal speed trước; slow motion dùng tìm contact/timing. Clip có tiếng khi nhận xét sync/mix; screenshot dùng cho layout/framing.
- Khi thử được, A/B có thể là hai cấu hình hoặc hai lượt tương đương; không bắt tạo toggle runtime cho mọi sửa nhỏ. Ghi người/công cụ đánh giá, điều kiện và giới hạn.
- Người chơi đánh giá cảm giác chủ quan; scripted interaction chỉ chứng minh đường đi và timing được đo. Agent review phải ghi đúng nguồn, không tự nhận human playtest.
- Giữ thay đổi khi đạt acceptance và không vi phạm invariant. Nếu chưa đạt thì ghi tiêu chí còn sai và vòng thử tiếp trong phạm vi task. Không tự chạy vòng lặp, gọi model nền, mua asset hay mở rộng chi phí vô hạn.
- Với task plan-only dừng ở plan; với implement hoàn thành phạm vi được yêu cầu. Thiếu Editor/device/audio capture thì tiếp tục phần độc lập và ghi chính xác gate chưa chạy, không tuyên bố game “đã feel tốt”.

## 5. Evidence và tiêu chí nghiệm thu của một task polish

| Claim | Bằng chứng phù hợp | Điều không thể suy ra |
| --- | --- | --- |
| Code/asset tích hợp được | Refresh/compile, Console và reload prefab/scene khi có thay đổi tương ứng | Game đã hay hơn |
| Input/timing cải thiện | Timestamp ở input/gameplay/presentation và kịch bản thực; nêu clock/method; video chỉ ước lượng theo frame capture | End-to-end device latency chính xác nếu không có đo phần cứng |
| Impact/motion rõ hơn | Clip tương tác normal speed ở camera thật; so hit/miss, ít/nhiều mục tiêu và interruption | Cảm giác haptics hoặc subjective preference của người chơi |
| Audio sync/mix đúng | Nghe runtime/recording đồng bộ, mute/volume branches khi liên quan | Audio tốt nếu chỉ kiểm tra component hoặc screenshot |
| Gameplay không sai | Focused tests/repro cho authority, duplicate event, skip/cancel, pool reuse, pause khi có rủi ro | Device performance |
| Chi phí trong budget | Profile trước/sau cùng device/build/scenario, concurrency đại diện | Player FPS từ recording throughput hoặc compile pass |
| Người chơi thích bản mới | Playtest/A-B thật, người tham gia và phạm vi câu hỏi được ghi | Retention hoặc doanh thu tăng |

Task handoff: thay đổi và lý do, parameter cũ/mới, asset/code đã sửa, evidence links, invariant đã kiểm tra, kết quả `pass/fail/degraded/not-run` và hạn chế. Không bắt build hay full-device matrix cho một chỉnh UI nhỏ. Nếu claim performance/device thì cần evidence ở tầng đó.

## 6. Thiết kế skill và tích hợp toolkit

File đề xuất, **chưa tạo**:

```text
skills/production/game-polish/
  SKILL.md
  references/diagnosis-and-priorities.md
  references/control-and-impact.md
  references/ui-reward-and-rhythm.md
  references/verification.md
  assets/polish-pass.md
```

- `SKILL.md`: workflow gọn A–E, boundaries và routing theo symptom. References chỉ tải nhánh cần dùng; mood/readability/audio/camera được đặt cùng quyết định liên quan, không nhân bản handbook.
- `polish-pass.md`: template nhẹ cho brief, coverage/backlog, experiment và evidence; mục không áp dụng được bỏ. Không tạo schema mới hoặc script đo “game feel score” khi chưa chứng minh nhu cầu deterministic.
- Registry: `category: production`, `authoringProfile: compact-workflow`, `maturity: experimental`; owner dự kiến dùng ID có sẵn `dreamy_skill_author`, `dreamy_unity_developer`, `dreamy_unity_editor`, `dreamy_tester`. Evidence requirements hướng vào project baseline, interaction acceptance và verification phù hợp claim; không bắt ảnh cho audit source-only.
- Phân phối qua `modules/production/module.json` để có trong hai preset production. Không thêm module/preset/dependency runtime mới. Preset thiếu production vẫn dùng skill domain hiện có; có thể mở rộng phân phối sau nếu nhu cầu thực chứng minh.
- Entry point tự đủ dùng khi thiếu các specialist tùy chọn. Routing/link phải sống được trong installation thực; không tạo đường dẫn bắt buộc tới sibling không được cài.
- Chỉnh routing thật ngắn trong `game-vibe-workflow`/`dreamy-feedback` nếu cần để phân biệt polish pass và kỹ thuật package; không rewrite các skill cũ.
- Cập nhật `skills/index.json`, `evals/catalog.json`, benchmark cases, docs usage và catalog summary theo generator hiện có. Không đổi phase/maturity toolkit chỉ vì thêm skill.
- Automatic discovery giữ mặc định. Không cài global, promote candidate hay chạy background evaluation trong đợt lập plan.

## 7. Bộ đánh giá đề xuất

Đánh giá **quyết định và artifact**, không chỉ keyword/heading. Dùng case development và holdout tách biệt; đối chiếu baseline không có skill với candidate trên cùng input/environment. Native/model evaluation chỉ chạy trong lượt thực thi được cho phép; không tự thu transcript hoặc spawn worker.

| Case | Request / dữ liệu | Điều cần quan sát |
| --- | --- | --- |
| P1 | Platformer nhảy gần mép bị rơi, source + repro | Điều tra input/forgiveness; không mặc định thêm shake, không tạo double jump |
| P2 | Combat “đánh không có lực”, clip + code | Khớp contact/event, reaction/audio/camera; giữ damage/cooldown và phân biệt hit/miss |
| P3 | Cozy puzzle “satisfying hơn, ít motion” | Điều chỉnh nhịp/âm/UI nhẹ; không bê recipe combat/hit-stop |
| P4 | Reward skip/reopen trong lúc animation | Reward đúng một lần, UI tiếp tục được, callback cũ không chạy sai |
| P5 | Mobile nhiều hit đồng thời | Kiểm tra readability, spam và measured cost; không đặt budget tùy tiện rồi gọi pass |
| P6 | Input tốt nhưng animation có chủ ý heavy | Giữ intent; không auto xóa anticipation hoặc đổi difficulty |
| P7 | Chỉ có screenshot, không Editor/audio/device | Nêu rõ giả thuyết và evidence thiếu; không claim motion/audio/feel đã xác nhận |
| P8 | Pause/slow motion/pool reuse; có network prediction | Chọn clock/authority phù hợp; không global-freeze tùy tiện, không duplicate feedback |
| N1 | Chỉ tạo prefab explosion | Route VFX authoring; không mở polish pass cả game |
| N2 | Chỉ sửa font/safe area hoặc GC spike | Route UI/profiling; không thêm feature juice |
| C1 | Plan-only, no-build, no-AI, không thêm package | Không sửa game/cài dependency/gọi ảnh/build |
| C2 | “Polish cả game”, đủ screen/loop list | Pilot là checkpoint; coverage cuối bao phủ toàn scope |

Semantic acceptance dự kiến: tất cả hard constraints/scope/authority/evidence honesty phải đạt ở mọi case liên quan; candidate chọn nguyên nhân có cơ sở và phương án có thể kiểm chứng ở các positive cases. Không promote chỉ vì tổng điểm cao che một lỗi critical. Giữ rubric/artifact review và kết quả từng case, kể cả case kém hơn baseline.

## 8. Lộ trình triển khai và gate

| Phase | Công việc | Điều kiện xong |
| --- | --- | --- |
| P0 — thiết kế | Chốt name, boundaries, dữ liệu brief và nguồn | Không trùng ownership; facts/contract/unknown tách rõ |
| P1 — author | Viết entrypoint, bốn references và template nhẹ | Không scaffold bỏ dở; entrypoint trong budget; không API giả |
| P2 — tích hợp | Registry, production module, docs, eval specs, generated summary | Link/install resolution đúng; không kéo package hoặc specialist bắt buộc ngoài preset |
| P3 — structural/distribution | Validator, `npm test`, isolated install kiểm tra production và preset không có production | Tests pass; install/uninstall không sửa bytes của user; preset không liên quan giữ nội dung mong đợi |
| P4 — behavioral | Chạy baseline/candidate trên cases, review artifact/holdout | Constraint gates đạt; ghi kết quả thật và giới hạn model/tool |
| P5 — Unity pilot | Một action/control slice và một UI/reward hoặc puzzle slice; ưu tiên project/lab được chỉ định | Compile/Console, interaction, clip/audio phù hợp và lifecycle evidence; performance chỉ pass khi đo |
| P6 — bàn giao | Usage guide, validation receipt, limits và checklist rollout | Distinguish authored/installed/evaluated/pilot/device/human; chưa đủ gate giữ experimental |

Thứ tự ưu tiên nội dung MVP: **chẩn đoán + ưu tiên + verification**, sau đó recipe control/impact và UI/reward. Có thể defer genre recipes nâng cao, hardware latency tooling và bộ phân tích video tự động. Không defer boundary/authority/evidence honesty.

Pilot không cần polish một game mới từ đầu. Dùng hai tương tác nhỏ đã chạy được để quan sát quyết định và kết quả; không lấy thành công của hai slice làm chứng nhận mọi thể loại. Thay đổi số lượng evaluation/pilot theo tài nguyên được cấp, ghi phần chưa chạy thay vì tạo receipt giả.

## 9. Trạng thái của đợt lập plan

- Đã nghiên cứu source nội bộ, authoring rules và sáu nguồn primary ở bảng trên; đã tạo tài liệu này.
- Chưa tạo/cài skill, sửa catalog/module/runtime hoặc game, chạy Unity/build, semantic evaluation hay playtest.
- Verification đợt này: local Markdown links tồn tại; `git diff --check` pass; `npm test` exit 0, 172 pass / 1 skip / 0 fail. Skip là PowerShell installer; context validator báo 6 size advisories. Chỉ có tài liệu plan mới trong working tree. Không dùng kết quả toolkit tests làm bằng chứng rằng workflow polish đã hiệu quả.

## 10. Kết quả triển khai 2026-11-16

- Đã tạo `skills/production/game-polish/`: entrypoint 4.487 byte, bốn references, template pass và metadata có automatic discovery.
- Đã đăng ký production module/catalog, thêm routing tùy chọn ở feedback và game-vibe verification, 12 catalog cases và benchmark baseline/candidate có development/holdout. Preset `dreamy-package` cũng nhận skill vì đã chứa production; không sửa preset hoặc thêm dependency.
- Hai distribution tests xác nhận global lifecycle trong home tạm, Unity consumer không có Dreamy, byte/link integrity, preservation và preset inclusion/exclusion. `npm test`: 174 pass / 1 skip / 0 fail; PowerShell installer skip trên môi trường này.
- Pack smoke đã pass khi cô lập user npm config cho riêng command (`npm_config_userconfig=/dev/null`); không sửa npmrc. Lượt mặc định trước đó fail `EALLOWSCRIPTS`.
- Preparation tạo 16 not-run slots cho 8 development cases × 2 treatments; không gọi model, không đánh giá holdout, không có semantic pass. Thiếu configured adapter là lý do chưa chạy P4. Chưa có game/project/scenario đích nên không tự chọn game khác để chạy P5; chưa có Unity/device/human quality evidence.
- Không cài vào global thật, không chỉnh game hoặc gọi model nền. Skill được phân phối ở trạng thái experimental; creation/distribution hoàn tất với các verification gap đã nêu.
