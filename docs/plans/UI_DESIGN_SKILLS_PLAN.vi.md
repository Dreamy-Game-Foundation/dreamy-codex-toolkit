# Kế hoạch skill thiết kế frontend, Unity Editor và giao diện tool

Ngày khảo sát: **23/11/2026**. Trạng thái hiện tại: **đã triển khai bộ skill experimental và tích hợp catalog; pilot sản phẩm/render và semantic eval còn chưa xác minh**. Các mục 1–10 giữ bối cảnh và contract của plan ban đầu; kết quả triển khai thực tế ở mục 11.

Mục tiêu: giúp agent làm ra giao diện đủ hoàn thiện để phát hành và bán thương mại: bố cục có chủ đích, thông tin dễ đọc, trạng thái rõ ràng, hình ảnh đồng bộ và tài nguyên có nguồn gốc. Đề xuất **3 skill mới**, một bộ hướng dẫn thị giác dùng chung và pilot có screenshot thực tế. Không mặc định biến mọi tool thành website hoặc bắt tất cả sản phẩm dùng cùng một theme.

## 1. Căn cứ và phần chưa biết

### Observed facts — đã kiểm tra

- Baseline: `d4ac7e8e1d787f8fd21d797c4fd381b7b0b987b5`; working tree sạch lúc bắt đầu. [toolkit.json](../../toolkit.json) ghi `0.1.0-alpha.4`, trạng thái `alpha`; repo là toolkit Node ESM, không phải frontend app hay Unity project sản phẩm.
- Đã có [unity-editor-tooling](../../skills/unity-editor-tooling/SKILL.md), [unity-ui](../../skills/unity-ui/SKILL.md), [unity-ui-reskin](../../skills/unity-ui-reskin/SKILL.md), [unity-ui-responsive](../../skills/unity-ui-responsive/SKILL.md) và [visual-review](../../skills/production/visual-review/SKILL.md). Chúng bao phủ kỹ thuật editor, uGUI và bằng chứng hình ảnh; chưa có workflow chuyên thiết kế frontend hoặc giao diện tool từ brief tới kết quả phát hành.
- `unity-editor-tooling` thuộc module `foundation`; các skill uGUI thuộc `unity-core`; `visual-review` thuộc `production`. Không di chuyển các owner này chỉ để thêm nhóm thiết kế.
- [Compatibility Unity](../../compatibility/unity.json) có `tested: []`. Fixture hiện chưa chứng minh một editor UI framework hoặc theme đã hoạt động. Không tuyên bố version support từ tài liệu tham khảo.
- Plan [Local Dashboard](DREAMY_LOCAL_DASHBOARD_IMPLEMENTATION_PLAN.vi.md) chọn TUI cho MVP. Đây là contract riêng; plan này không tự thay nó bằng React/web app.
- Đường dẫn `docs/agents/dreamy-workflow.md` được AGENTS.md nhắc tới không tồn tại trong checkout. Đã đọc [bản template](../../templates/dreamy-workflow.md). Lesson recall đúng session cho scope thiết kế UI không có kết quả phù hợp.
- Đã đọc tài liệu thiết kế và license chính thức liên kết ở mục 4–5. Chưa tải, vendor hoặc đưa tài nguyên bên ngoài vào sản phẩm.

### Intended contracts — đề xuất

- Mỗi skill tạo được brief ngắn, hướng thiết kế, triển khai đúng nền tảng và kết quả kiểm chứng; hỗ trợ cả tạo mới lẫn nâng cấp giao diện hiện có.
- Thiết kế dựa trên tác vụ và dữ liệu thật. Có thể chọn concept khi người dùng chưa có style; giữ brand và stack đã được yêu cầu.
- Asset được nhúng hoặc phân phối phải có quyền phù hợp với **cách phát hành thực tế**, kèm notice cần thiết. Không lấy nhãn “free” làm bằng chứng.
- Việc hoàn thành plan không nâng maturity/version hoặc chứng minh chất lượng skill.

### Unresolved hypotheses — cần pilot

- Người dùng thấy tool “nháp”; phiên khảo sát này chưa có tool cụ thể hoặc screenshot để chẩn đoán nguyên nhân. Chưa thể kết luận lỗi là typography, màu, layout hay thiếu trạng thái.
- Ba skill là mức tách hợp lý; routing eval phải kiểm chứng chỗ giao giữa frontend app và tool UI.
- Shared tokens có thể tạo cảm giác đồng bộ giữa web và Unity Editor; cần kiểm chứng mapping và giới hạn renderer, không hứa pixel parity.
- Chưa chọn Unity Editor, stack web, tool mục tiêu, kênh bán hoặc nhà cung cấp sinh ảnh cho pilot. Chọn từ project thực khi triển khai; không mặc định cài dependency mới.

## 2. Bộ skill và ranh giới trách nhiệm

| Skill đề xuất | Chủ sở hữu chính | Đầu ra | Không sở hữu |
|---|---|---|---|
| `frontend-design` | Thiết kế và triển khai presentation của website/web app trên stack hiện có | Trang/component chạy được, responsive, typography, interaction states, accessibility và ảnh render thật | Backend, chọn lại framework mặc định, thay logic nghiệp vụ |
| `tool-ui-design` | UX của công cụ làm việc: dashboard, asset browser, configuration, import/export, validator, batch workflow | Kiến trúc thông tin, task flow, density, selection/filter, inspector, feedback tiến trình/lỗi; implementation theo shell đang có | Tự đổi TUI/native thành web, toàn bộ nghiệp vụ tool, API Unity |
| `unity-editor-ui` | Presentation của EditorWindow, custom Inspector và tool panel trong Unity Editor | UI Toolkit/UXML/USS hoặc IMGUI theo project; light/dark skin, dock/resize, editor controls và lifecycle | uGUI trong game, đổi serializer, author importer/build pipeline |

Routing theo tác vụ:

- Landing page, portfolio, product website → `frontend-design`.
- Dashboard web mới → `tool-ui-design` quyết định workflow; `frontend-design` chỉ đọc khi cần phần renderer web. Đổi màu một component web nhỏ không bắt buộc tải toàn bộ workflow tool.
- EditorWindow/importer panel → `unity-editor-ui`; đọc reference UX của tool khi thay đổi luồng nhiều bước. `unity-editor-tooling` giữ quyền sở hữu Undo/save/asset mutation và Runtime–Editor boundary.
- Popup/HUD trong game → skill uGUI hiện có. Nếu cải thiện art direction cho uGUI, mở rộng reference của `unity-ui-reskin`, không kéo `unity-editor-ui` sang runtime.
- Sửa race condition, callback hoặc dữ liệu mà không ảnh hưởng presentation → skill domain hiện có; không tự kích hoạt redesign.
- TUI giữ ký tự/ANSI, thứ tự tab/phím và giới hạn terminal; không ép dùng ảnh, bo góc hoặc pixel token.

Mỗi entrypoint dùng profile `compact-workflow`, theo [quy ước authoring](../skill-authoring.md): mục tiêu 300–800 token, trần 5.000 byte. Chỉ đọc reference theo nhánh, tránh 3 skill cùng lặp một checklist dài.

## 3. Workflow thiết kế phải được dạy

### 3.1. Khảo sát giao diện thật

Đọc source, instructions, stack/version, component đang có và flow liên quan. Với UI có sẵn: chụp trạng thái trước khi sửa nếu có công cụ; liệt kê 3–5 vấn đề nhìn thấy được, gắn ảnh/vùng cụ thể. Với project mới: xác định người dùng, tác vụ thường xuyên, dữ liệu, viewport và constraints.

Không gọi mọi màn hình là dashboard. Chọn cấu trúc theo tác vụ: table khi cần so sánh; list–detail khi cần duyệt rồi chỉnh; wizard khi có bước phụ thuộc; canvas khi thao tác trực tiếp; form khi cấu hình. Không biến mọi giá trị thành card.

### 3.2. Chọn concept có lý do

Nếu chưa có brand, đề xuất tối đa 2 hướng thích hợp, chọn một mặc định và ghi giả định để tiếp tục. Không bắt người dùng chọn theme trước mọi chỉnh sửa nhỏ. Tham khảo nguyên lý từ nguồn ở mục 4; phân biệt reference với thiết kế sao chép.

Đầu ra brief: đối tượng sử dụng, tác vụ chính, shell, concept, density, tone, icon family, typography, token cốt lõi và những state cần triển khai. Task nhỏ có thể gói trong vài dòng; không tạo hồ sơ thiết kế nặng cho một nút.

### 3.3. Dựng hệ thống trước, polish điểm quan trọng

- Semantic tokens: background/surface/elevated, text/muted, border, accent, focus, selected, success/warning/error. Màu trạng thái luôn đi cùng nhãn hoặc icon có nghĩa.
- Spacing theo scale nhỏ; type scale phân rõ page title/section/body/metadata. Số liệu, path và log có thể dùng mono; nội dung chính không mặc định mono.
- Density có chủ đích: compact cho thao tác thường xuyên; comfortable cho onboarding. Vùng click, baseline và focus vẫn dễ dùng khi compact.
- Component states: default, hover nếu có pointer, focus, active/selected, disabled, loading, empty, error, success. Không vẽ nút chưa hoạt động mà trình bày như tính năng hoàn tất.
- Nội dung thật: tên dài, số lớn, danh sách rỗng/đông, lỗi nhiều dòng, text tiếng Việt. Không đánh giá UI chỉ bằng lorem ipsum hoặc dữ liệu đẹp giả định.
- Motion hỗ trợ định hướng và phản hồi; không làm chậm thao tác lặp. Respect reduced motion trên web; editor có phương án ít chuyển động.
- Dùng component/style đã có trước khi thêm library. Nâng cấp layout/typography thường cần trước khi thêm illustration.

### 3.4. Kiểm tra trong nền tảng thật

Web: responsive, keyboard, focus, semantics, contrast, reduced motion và dữ liệu ở các state. Unity Editor: skin, docking, narrow window, DPI, serialized binding và lifecycle. Tool: selection, tìm kiếm, validation, tiến trình, hủy/retry nếu nghiệp vụ có hỗ trợ, khả năng đọc lỗi và quay lại công việc.

Sửa lỗi nhìn thấy trong phạm vi đã giao, chụp lại và báo phần chưa kiểm tra. Dùng [visual-review](../../skills/production/visual-review/SKILL.md) khi được cài; nếu thiếu, dùng capture tool của task và báo nơi lưu ảnh. Mockup/sinh ảnh không phải screenshot của implementation.

## 4. Style/concept tham khảo hiện đại

Đây là các hệ thống đang được duy trì và hướng thiết kế phù hợp sản phẩm hiện tại, **không phải bảng xếp hạng độ phổ biến**. Tên các concept dưới đây là nhãn mô tả của plan.

| Hướng | Nguồn và nguyên lý học được | Ứng dụng đề xuất | Tránh |
|---|---|---|---|
| Precise neutral | [Geist](https://vercel.com/geist/introduction): nền trung tính, hierarchy rõ, component nhất quán | Developer tools, settings, validator; hướng mặc định cho Dreamy tools | Chữ phụ quá nhạt, mọi panel cùng độ nổi, dùng toàn bộ logo/brand của hãng |
| Dense workstation | [Carbon data table](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines): toolbar, filter, selection, expandable detail | Asset browser, batch operations, reports, import/export | Card grid khi cần so sánh hàng/cột; ẩn thao tác chính trong menu sâu |
| Accessible adaptable | [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction): primitive có thể tùy biến và hỗ trợ accessibility | Web tool có form/dialog/menu phức tạp, nếu stack React phù hợp | Coi component library là art direction hoàn chỉnh; tự thêm React vào project khác |
| Controlled expressive | [Material 3 Expressive](https://m3.material.io/get-started): typography, shape, color và motion tạo điểm nhấn | Onboarding, trang sản phẩm, màn hình chọn template/asset | Dùng hình trang trí lớn trong Inspector hoặc panel cần density cao |
| Native editor | [Unity USS](https://docs.unity3d.com/6000.0/Documentation/Manual/UIE-USS.html): styling theo hệ UI Toolkit và version | EditorWindow/Inspector hòa hợp Unity, có nhấn brand ở mức vừa phải | Mang nguyên CSS web vào USS; custom control thay native chỉ để khác biệt |

**Dreamy mặc định đề xuất:** Precise neutral + Dense workstation cho tool; Native editor cùng semantic palette cho Unity; cho phép Controlled expressive ở marketing/onboarding. Cùng ngôn ngữ thị giác, component được điều chỉnh cho từng host.

Glass/translucency, gradient, bento, neo-brutalism và 3D illustration có thể dùng khi hợp brief. Không đặt chúng thành template mặc định; phải giữ contrast, density, hiệu năng và tính nhất quán của hệ thống đang có.

Tokens khởi đầu để thử nghiệm, chưa là chuẩn bắt buộc:

- Spacing: 4/8/12/16/24/32 logical units; mapping riêng cho CSS, USS và IMGUI.
- Web body 14–16 px; dense metadata 12–13 px chỉ khi vẫn dễ đọc; Unity ưu tiên font/control sizing native.
- Một accent chủ đạo, palette trạng thái riêng; 2–3 cấp surface và radius nhỏ cho tool. Light/dark là semantic mapping, không invert màu cơ học.
- Một icon family và weight chủ đạo; cỡ 16/20/24 tùy component, optical alignment kiểm tra ở kích thước thật.
- Font web: cân nhắc Inter hoặc Noto Sans với glyph tiếng Việt đã kiểm tra; Editor ưu tiên native font. Mono chỉ cho dữ liệu cần phân biệt ký tự.

## 5. Tài nguyên cho sản phẩm thương mại

### 5.1. Nguồn và giới hạn lựa chọn

| Tài nguyên | Nguồn đã tham khảo | Quy tắc đưa vào skill |
|---|---|---|
| Icon mặc định | [Lucide license](https://lucide.dev/license): ISC; phần kế thừa Feather có MIT notice | Chọn subset cần dùng, giữ đủ notice áp dụng; đọc license của version thực sự tải. Ưu tiên cho giao diện tool trung tính |
| Icon thay thế | [Phosphor license](https://raw.githubusercontent.com/phosphor-icons/core/main/LICENSE): MIT | Dùng khi brief cần family/weight khác; không trộn tùy hứng với Lucide trong cùng hệ icon |
| Font | [Google Fonts](https://developers.google.com/fonts/): catalog cho phép dùng trong dự án thương mại | Kiểm tra file license của từng family/version, quyền embed/redistribute/modify và Reserved Font Names khi có; giữ notice. Kiểm tra tiếng Việt và fallback |
| Illustration/game UI pack | [Kenney support](https://kenney.nl/support): asset ở asset pages được công bố CC0 | Lấy đúng pack có license đi kèm; không suy rộng sang mọi nội dung trên website; chỉ dùng khi cùng art direction |
| Ảnh chụp | [Unsplash license](https://unsplash.com/license), [terms](https://unsplash.com/terms) | Tùy chọn cho trang nội dung/marketing; không mặc định nhúng vào bộ template bán lại. Kiểm tra ảnh, loại dịch vụ và cách phân phối; quyền dùng thương mại không tự giải quyết mọi quyền liên quan tới chủ thể/nhãn hiệu |
| Illustration tự tạo | SVG/code tự vẽ hoặc image generator đang có | Ghi nguồn và quy trình; AI output không mặc nhiên là CC0 hoặc có độc quyền. Kiểm tra điều khoản provider/plan tại thời điểm tạo, quyền với input và kết quả cuối |

Thứ tự ưu tiên: asset hiện có có quyền rõ → icon/font permissive đồng bộ → vector/code tự tạo → illustration gen khi cần → stock phù hợp. Không buộc thêm ảnh vào tool nếu thông tin và thao tác đã đủ rõ.

Tách ba tình huống: **dùng trong nội bộ**, **nhúng trong app thương mại**, **phân phối file nguồn/template/asset trong toolkit bán cho bên thứ ba**. Một license phù hợp tình huống trước chưa đủ để kết luận cho tình huống sau. Ví dụ, ảnh stock không được coi là một asset pack có thể bán lại chỉ vì tải miễn phí. Screenshot/reference công khai cũng không tự cho phép copy artwork hoặc brand.

### 5.2. Asset provenance tối thiểu

Khi có external/generated assets thực sự đi vào deliverable, tạo hoặc cập nhật manifest mà project đang dùng. Nếu chưa có quy ước, dùng `design/asset-manifest.json` trong project đích; đây là đường dẫn dự kiến, không tạo file rỗng ở mọi task.

Mỗi record chứa: local path, source URL hoặc provider/model và generation date, author khi biết, version/commit hoặc download date, hash, license/terms URL, nơi giữ bản notice/license, modifications, intended usage/distribution và attribution cần giao kèm. Với generated asset, thêm prompt hoặc recipe đủ tái tạo, input references và kết quả kiểm tra quyền; trường chưa biết ghi `unknown`, không suy đoán thành `cleared`.

Khi phát hành có third-party assets, bàn giao notice theo quy ước repo, ví dụ `THIRD_PARTY_NOTICES.md` cùng license cần thiết. Không đổi nhãn mọi asset sang MIT vì repository dùng MIT. Thiếu quyền phù hợp thì thay bằng nguồn rõ hoặc tự tạo trong phạm vi task; chỉ cần hỏi khi lựa chọn còn lại phụ thuộc người dùng.

### 5.3. Sinh hình đồng bộ

- Định nghĩa style recipe trước: palette, stroke, shape, lighting, perspective, material, nền, tỷ lệ, mật độ chi tiết và kích thước đích.
- Dùng một key visual/ảnh đã duyệt làm reference cho các biến thể khi công cụ hỗ trợ; giữ recipe/provider/version để giải thích khác biệt. Seed không được xem là bảo đảm tái tạo giữa model/version.
- Icon thao tác thông thường ưu tiên vector từ một family; imagegen phù hợp hero art, empty-state illustration hoặc background texture cần thiết. Không gen từng icon CRUD độc lập.
- Không bake chữ vào ảnh cho controls/labels; giữ text trong UI để hỗ trợ dịch và accessibility. Kiểm tra viền alpha, silhouette ở cỡ nhỏ, light/dark và nền thật; lưu source gốc khi cần chỉnh tiếp.
- Theo đúng tool image generation đang có; nếu không có, tiếp tục bằng SVG/CSS/USS/native controls phù hợp và ghi rõ limitation. Không tự thêm subscription hoặc dịch vụ trả phí.

## 6. Những điểm riêng của Unity Editor

Skill `unity-editor-ui` phải phân biệt presentation với việc ghi asset:

- Đọc `ProjectVersion.txt`, manifest/lock, asmdef, custom inspectors/windows, base styles và compatibility trước khi chọn API. Tài liệu UI Toolkit chỉ là nguồn kỹ thuật tham khảo theo version, không chứng minh project đã hỗ trợ.
- UI Toolkit là ứng viên ưu tiên cho cửa sổ mới khi project/version phù hợp; IMGUI tiếp tục dùng cho tool hiện hữu hoặc phạm vi nhỏ. Không migration toàn bộ chỉ để polish.
- Tách structure/style/behavior theo convention project; giữ binding, serialized property path và multi-object/prefab override semantics. Có Undo, dirty/save đúng owner khi task thực sự ghi dữ liệu.
- Dùng controls native cho object reference, enum, numeric và property fields khi phù hợp. Custom Inspector phải giữ khả năng chọn/chỉnh nhiều object theo contract đang có.
- Web CSS và USS không tương đương; map token theo property được version hỗ trợ. Không hứa shadow, blur, layout hoặc SVG import như browser. SVG/vector có thể cần package; dùng raster fallback có license nếu project chưa hỗ trợ và không cần cài thêm package.
- Event handlers, scheduled work và state của window có owner/cleanup; kiểm tra đóng/mở lại và domain reload khi liên quan. Không dùng repaint/polling liên tục chỉ để tạo animation trang trí.
- Chạy compile/Console và test nhỏ có ý nghĩa khi thay C#; screenshot thật cho kết quả thị giác. Static validation không thay thế việc mở/dock/resize EditorWindow.

## 7. Cấu trúc và tích hợp dự kiến

```text
skills/design/frontend-design/
  SKILL.md
  references/web-implementation.md
skills/design/tool-ui-design/
  SKILL.md
  references/tool-patterns.md
  references/design-foundations.md
  references/commercial-assets.md
skills/unity-editor-ui/
  SKILL.md
  references/editor-presentation.md
modules/interface-design/module.json
presets/interface-design.json
```

Đây là cấu trúc dự kiến, không phải file đã tồn tại. `design-foundations.md` và `commercial-assets.md` có một owner ở `tool-ui-design`; frontend/editor chỉ link và đọc khi cần. Module `interface-design` đề xuất chứa cả 3 skill để giữ link cùng được phân phối; dependency `foundation`. Kiểm chứng installer có giữ layout reference và cài được cùng Unity presets trước khi chốt wiring.

Không đưa UI design vào mọi preset Unity bằng mặc định. `interface-design` là lựa chọn cài thêm, dùng chung với preset hiện tại. Nếu pilot cho thấy cần cài lẻ, bổ sung cơ chế phân phối reference đúng cách; không để installed skill có link hỏng. Không giả định skill ngoài toolkit như imagegen hoặc browser CLI luôn có: capability detection và fallback nằm trong hướng dẫn.

Khi implementation: cập nhật `skills/index.json`, module/preset và `toolkit.json` cho nội dung đã có; thêm case trong eval/benchmark catalog theo convention hiện tại, cập nhật catalog summary/README bằng cơ chế repo. Không thêm agent chuyên biệt, runtime dependency hoặc schema chỉ để có tên mới. Metadata depth/owner chọn từ schema và registry thực tế lúc triển khai; frontend-specific owner còn là câu hỏi mở vì agents hiện có chủ yếu chuyên Unity.

Chỉ thêm script/token exporter hoặc starter assets nếu pilot cho thấy lợi ích tái sử dụng cụ thể; chưa tạo component library đa nền tảng trước khi biết host. Không vendor toàn bộ design system chỉ để tham khảo style.

## 8. Lộ trình thực hiện

| Giai đoạn | Công việc | Điều kiện xong |
|---|---|---|
| P0 — Baseline/pilot brief | Chọn một web/tool thực và một EditorWindow thực từ phạm vi được giao; ghi task, stack, state, screenshot trước và tiêu chí | Xác định được vấn đề cụ thể, không chẩn đoán qua cảm giác; có fallback nếu thiếu project |
| P1 — Shared design guidance | Viết foundations, concept selection, asset provenance và recipe gen; brief mẫu vừa đủ | Reference có nguồn, phân biệt thương mại/redistribution, không tạo mệnh lệnh style áp cho mọi project |
| P2 — Skill drafts | Viết 3 entrypoints compact, references theo nhánh và routing với skill cũ | Đạt frontmatter/budget/link checks; positive/negative/conflict cases sẵn sàng; chưa nâng maturity |
| P3 — Pilots | Dùng draft hoàn thành từng pilot; sửa lỗi và lưu ảnh thực, implementation, notices, verification | Có kết quả render thật và thao tác hoạt động; thiếu host nào ghi degraded riêng host đó |
| P4 — Integration | Đăng ký module/preset/catalog, thử install/update/uninstall vào thư mục tạm; chạy eval thích hợp và `npm test` | Không hỏng ref, không ghi đè user bytes, routing đúng, report giới hạn còn lại |

Phụ thuộc: P0 → P1 → P2 → P3 → P4. Ưu tiên workflow tool và renderer đang có để pilot ra giá trị sớm; chưa chạy cả loạt redesign sản phẩm. Nếu thiếu Unity project, vẫn hoàn thành draft và web pilot có thể chạy; không nhận đã chứng minh Unity visual quality.

## 9. Acceptance và eval

### Bộ case tối thiểu

| Loại | Prompt/tình huống | Hành vi cần quan sát |
|---|---|---|
| Positive web | “Làm trang giới thiệu tool hiện tại đẹp và chuyên nghiệp hơn, giữ stack” | Chọn frontend, giữ stack, cải thiện hierarchy/responsive, ảnh thật; không tự thêm backend |
| Positive tool | “Asset browser khó duyệt, cần tìm kiếm và bulk actions rõ” | Chọn tool UX; list/detail/table phù hợp; selection và trạng thái có nghĩa, không chỉ thêm card |
| Positive Editor | “Polish EditorWindow đang có, giữ binding và chức năng” | Chọn editor presentation; giữ UI framework khi hợp lý; resize/skin/native fields được kiểm tra |
| Near miss runtime | “Sửa anchors popup uGUI trên điện thoại” | Dùng responsive/reskin hiện có; không tạo EditorWindow hoặc web app |
| Near miss logic | “Nút import gọi callback hai lần” | Điều tra lifecycle/domain; không tự redesign toàn bộ tool |
| Conflict style | “Giữ theme sáng và brand đỏ; bỏ animation” | Tôn trọng brief; không ép dark, accent xanh hoặc motion mặc định |
| Conflict commercial | “Icon free nhưng chỉ cho personal use; tool sẽ bán” | Không ship asset đó; chọn nguồn hợp quyền, giữ provenance/notices |
| Distribution | “Bán source template gồm font/icon/ảnh” | Kiểm tra quyền phân phối source riêng; không đồng nhất commercial use với resale |
| Missing tool | “Gen illustration nhưng không có image generator” | Dùng phương án khả thi hoặc ghi thiếu capability; không bịa ảnh/generated receipt |
| TUI boundary | “Polish terminal dashboard, giữ terminal” | Giữ host và interaction terminal; không tạo web UI thay thế |

### Điều kiện pilot đạt

- Nhìn: hierarchy/spacing/alignment nhất quán; text không bị clip; icon cùng family; action chính dễ tìm; dữ liệu dày vẫn đọc được. Chỉ rõ ảnh/state chứng minh, không dùng điểm thẩm mỹ tự chấm làm bằng chứng duy nhất.
- Web: viewport nhỏ/vừa/lớn hợp supported scope; keyboard/focus; contrast theo [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/) với text thường 4,5:1, text lớn 3:1 và non-text UI liên quan 3:1 khi áp dụng. Không tuyên bố đạt toàn bộ WCAG chỉ từ vài phép đo.
- Editor: dock narrow/normal/wide, light/dark, DPI mục tiêu, label/path dài; đóng/mở lại; chọn nhiều object và override state nếu chỉnh custom Inspector. Thu hẹp state matrix theo tính năng thực.
- Interaction: search/filter/selection và empty/loading/error state được chạy với dữ liệu phù hợp. Hành vi cancel/retry/undo chỉ yêu cầu khi thuộc contract của tool.
- Thương mại: mọi external/generated asset được ship có record nguồn và quyết định quyền dùng/phân phối, notice cần thiết đi kèm; asset chưa rõ quyền đã được thay hoặc loại khỏi deliverable.
- Bằng chứng: phân biệt structural checks, behavioral eval, web render, Unity compile và Editor render. Benchmark text/keyword không tự chứng minh đẹp hoặc tương tác đúng. Không tự chạy background model eval hay promote skill.
- Regression: component/shared style thay đổi phải kiểm tra consumer bị ảnh hưởng trong phạm vi; tests chỉ thêm khi bảo vệ hành vi có rủi ro, không test lại từng hằng số màu.

## 10. Deliverables và trạng thái xác minh

Khi triển khai xong: 3 skill và references có routing rõ; module/preset cài được; pilot source; screenshot trước/sau thật; asset manifest/notices nếu dùng tài nguyên; kết quả eval và test cùng các limitation. Mỗi pilot bàn giao concept/token decisions để lần sửa sau giữ đồng bộ.

**Lần lập plan này:** chỉ bổ sung tài liệu này và kiểm tra repository. Chưa tạo skill, asset hoặc UI, chưa cài package, chưa mở Unity và chưa chụp sản phẩm. `npm test` kiểm tra tính toàn vẹn repo, không xác minh chất lượng thị giác, quyền của asset chưa tải hay khả năng tương thích Editor chưa chạy. Không nâng phase toolkit.

## 11. Triển khai experimental ngày 23/11/2026

Người dùng đã yêu cầu triển khai và chọn Geist làm hướng tham khảo ưu tiên. Đã thêm:

- [frontend-design](../../skills/design/frontend-design/SKILL.md), [tool-ui-design](../../skills/design/tool-ui-design/SKILL.md), [unity-editor-ui](../../skills/design/unity-editor-ui/SKILL.md), cùng 5 reference có hướng dẫn theo nhánh. Geist-inspired neutral là default khi chưa có brand; không ép dark mode, framework hoặc migration.
- Module/preset `interface-design`, registry và README. Giữ version/phase toolkit; maturity cả 3 skill là `experimental`. Không thêm dependency hay vendor artwork/font/icon. Chưa có tài nguyên bên ngoài cần notice trong lần triển khai này.
- 10 routing/safety case definitions và benchmark baseline/candidate, gồm brand conflict, source redistribution, missing imagegen, TUI và thiếu Unity evidence. Chúng là case definitions, không phải 10 model passes.
- Test install/update/uninstall global cô lập và project tạm: giữ nguyên bytes của references, giải quyết mọi link Markdown tương đối trong bản cài, giữ user files/instructions và không đổi Unity packages.

Điều chỉnh so với cấu trúc dự kiến: cả 3 skill cùng ở `skills/design/` để sibling links còn đúng khi installer flatten chúng vào `.agents/skills/`. `interface-design` là preset riêng; không đưa vào `dreamy-full` vì đã quan sát validator từ chối module thứ 10 theo context budget. Không nới budget. CLI hiện không cộng dồn preset; README nêu rõ hành vi thay bộ skill được quản lý. Không cài lên global home hay Unity project thật của người dùng trong lần này.

Kết quả kiểm tra:

| Check | Kết quả và giới hạn |
|---|---|
| `node --test tests/unit/interface-design-distribution.test.mjs` | 2 pass: global cô lập và project fixture; link dùng chung hoạt động sau install/update |
| `npm test` | 176 pass, 1 skipped, 0 fail; structural/catalog/context/lifecycle checks thành công; 6 context size advisories của repo vẫn được báo |
| `npm_config_userconfig=/dev/null npm run pack:smoke` | Pass: đóng gói/cài npm cô lập; packed CLI validate/context, hook fixture và portable consumer đều pass. Lệnh `npm run pack:smoke` ban đầu gặp `EALLOWSCRIPTS` do cấu hình npm user `allow-scripts=pnpm` được kế thừa; lần chạy cô lập bỏ user config, vẫn giữ `--ignore-scripts` khi cài dependency và không sửa cấu hình máy |
| `node scripts/benchmark.mjs --manifest benchmarks/manifests/interface-design.json --output artifacts/interface-design/decision-probes` | Exit 2, degraded: chưa cấu hình model adapter; 0 attempted, 20 not-run (10 cases × 2 treatments). Không gọi model nền. Local report ở `artifacts/interface-design/decision-probes/report.json`, ngoài Git |
| Web/Unity product pilot | Chưa chạy: repo không có frontend sản phẩm hoặc EditorWindow mục tiêu. Không có screenshot sản phẩm, compile/render receipt hoặc kết luận đạt chất lượng thị giác |

P1/P2 và phần tích hợp/kiểm tra phân phối của P4 đã có artifact; P0/P3 và behavioral acceptance của P4 còn cần pilot trên project phù hợp. Không đánh dấu toàn bộ initiative production-ready. Các owner registry dùng specialist hiện có cho review/architecture/editor; không tạo agent frontend hay tuyên bố specialist Unity đã có kinh nghiệm frontend được đo lường.
