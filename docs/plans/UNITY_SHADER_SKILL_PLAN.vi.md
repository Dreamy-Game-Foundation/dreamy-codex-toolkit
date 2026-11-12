# Kế hoạch thiết kế skill shader cho Unity

Ngày khảo sát: **2026-11-03**. Trạng thái: **đã triển khai workflow experimental và tích hợp toolkit; Unity pilot được ghi riêng trong receipt**.

Đề xuất nâng cấp `$unity-shader` hiện có thành workflow đi từ brief hoặc shader lỗi tới shader/material chỉnh sửa được, có kiểm chứng đúng pipeline. Giữ một skill với ba chế độ **author / debug / optimize**, ưu tiên pilot URP; Built-in và HDRP được xử lý theo capability thực tế. Không tạo thêm skill gần trùng tên `unity-shader-authoring` ở vòng đầu.

## 1. Căn cứ, hợp đồng và phần chưa biết

### Quan sát đã kiểm tra

- Baseline HEAD: `17807b46b890595985e79ceac0f7b1911094cbed`. Khi bắt đầu đã có thay đổi của người dùng ở nhóm `unity-vfx-authoring` và thư mục `.research/`; giữ nguyên các thay đổi đó.
- [toolkit.json](../../toolkit.json) là nguồn trạng thái canonical: `0.1.0-alpha.4`, `alpha`. Đây là repository toolkit, không phải Unity project đích.
- [unity-shader](../../skills/unity-shader/SKILL.md) đã có trong [registry](../../skills/index.json), thuộc [module unity-rendering](../../modules/unity-rendering/module.json), maturity `practitioner`, chưa có reference hoặc eval case riêng. Trigger và failure modes còn lẫn camera/navigation/VFX; chưa có quy trình shader authoring cụ thể.
- [unity-material](../../skills/unity-material/SKILL.md), [unity-urp](../../skills/unity-urp/SKILL.md), [unity-rendering](../../skills/unity-rendering/SKILL.md), [unity-vfx-authoring](../../skills/unity-vfx-authoring/SKILL.md) và [unity-profiling](../../skills/unity-profiling/SKILL.md) đã có chủ sở hữu lân cận.
- `unity-full` cài module rendering; `unity-production` hiện không cài module này. Giữ vị trí phân phối hiện có trong đề xuất đầu tiên, không tự kéo rendering vào mọi preset.
- Root không có Unity manifest/lock. Manifest và lock của fixture `tests/fixtures/unity/vertical-slice/Packages/` đã được đọc; chỉ khai báo Test Framework, không chứng minh khả năng URP/Shader Graph. [Compatibility Unity](../../compatibility/unity.json) có `tested: []`.
- [Harness](../harness.md) có inspect/compile/console/tests/build adapters; chưa có operation chuyên dụng để render comparison, đếm shader variants hay đo GPU. `console` đọc log batchmode mới, không phải Console của Editor đang mở.
- Đường dẫn workflow được AGENTS.md dẫn tới `docs/agents/dreamy-workflow.md` chưa tồn tại trong source checkout; đã đọc bản nguồn [templates/dreamy-workflow.md](../../templates/dreamy-workflow.md) và [toolkit evolution](../toolkit-evolution.md). Lesson recall cho scope shader không trả về lesson phù hợp.

### Hợp đồng đề xuất

- Giữ tên `$unity-shader`; chuyển nội dung sang profile `compact-workflow`, entrypoint tối đa 5.000 byte theo [quy ước authoring](../skill-authoring.md). Các chi tiết chỉ đọc khi gặp nhánh tương ứng.
- Skill phải có ích khi người dùng chỉ đưa mô tả chữ; ảnh tham chiếu là đầu vào tùy chọn. Không mặc định cần AI image generation.
- Sản phẩm gồm shader/graph và include cần thiết, material mẫu, preview trong camera thật hoặc lab, tham số có ý nghĩa, giới hạn kỹ thuật và kết quả kiểm chứng. Demo scene/helper chỉ tạo khi task cần.
- Plan-only kết thúc ở brief, kỹ thuật và acceptance; không author shader hoặc thay đổi Unity project.
- Kỹ thuật từ GitHub là nguồn tham khảo. Import package, đổi pipeline và copy code không phải bước mặc định.

### Giả thuyết cần kiểm chứng

- Một entrypoint ngắn với reference theo quyết định có thể xử lý tốt author/debug/optimize mà không cần tách skill; xác minh bằng positive/negative/conflict eval.
- URP HLSL và Shader Graph là hai nhánh pilot đầu tiên phù hợp; chưa biết Editor, renderer, graphics API, art direction và device thật của project dùng skill.
- Chưa có receipt import/render/build/profile cho shader từ các repo khảo sát. README và commit đã đọc không tương đương khả năng tương thích đã chạy.

## 2. Các repo GitHub đã tham khảo

“Hot” ở đây là **phổ biến và có giá trị tham khảo**, không phải xếp hạng GitHub Trending hay tốc độ tăng sao. Tìm `unity shader stars:>1000`, bổ sung nguồn Unity chính thức và ví dụ chuyên sâu. Số sao là snapshot lúc truy vấn, không phải tiêu chí chất lượng duy nhất. Full SHA, URL cố định, metadata và phạm vi file đã đọc nằm trong [research snapshot](../research/unity-shader-skill-20261103.json).

| Repo | Sao quan sát | Nội dung có ích cho thiết kế skill | Giới hạn phải giữ |
|---|---:|---|---|
| [ColinLeung-NiloCat/UnityURPToonLitShaderExample](https://github.com/ColinLeung-NiloCat/UnityURPToonLitShaderExample) | 7.848 | Mẫu HLSL toon; tách lighting/shared; forward, outline, shadow/depth passes | Public code là tutorial Unity 2022.3, không phải full NiloToon thương mại; hình demo full version không chứng minh tutorial đạt cùng chất lượng |
| [QianMo/Awesome-Unity-Shader](https://github.com/QianMo/Awesome-Unity-Shader) | 4.362 | Phân nhóm effect và nền tảng blend/depth/culling | Nguồn cũ; chưa rõ license tái sử dụng từ metadata. Không copy theo tên “Awesome” hoặc suy ra SRP compatibility |
| [Unity-Technologies/Graphics](https://github.com/Unity-Technologies/Graphics) | 3.023 | Nguồn chính thức để tra pipeline/package và quy tắc chọn branch/tag theo Editor | `master` là development/alpha; dùng source đúng resolved package của target, không mặc định lấy master |
| [poiyomi/PoiyomiToonShader](https://github.com/poiyomi/PoiyomiToonShader) | 1.682 | Nhóm tham số phục vụ artist, feature organization, compatibility boundaries | README phân biệt Built-in/VRChat và gói URP riêng; không dùng một package cho mọi renderer/API hoặc áp dụng hướng dẫn xóa folder vào project người dùng |
| [keijiro/ShaderGraphExamples](https://github.com/keijiro/ShaderGraphExamples) | 1.264 | Cách tổ chức ví dụ graph nhỏ và tái sử dụng nguyên lý procedural | README nhắm Unity 2018.3+; chưa xác minh import graph vào Unity hiện tại. CC0 được nêu cho graph trong `Assets/Examples`, không mở rộng cho mọi asset |
| [ronja-tutorials/ShaderTutorials](https://github.com/ronja-tutorials/ShaderTutorials) | 1.067 | Nguồn bài tập/recipe nhỏ để phát triển tác vụ shader | README yêu cầu attribution CC-BY; không gán license MIT. Phiên khảo sát này đọc README, chưa audit từng shader |
| [Cyanilux/URP_ShaderGraphCustomLighting](https://github.com/Cyanilux/URP_ShaderGraphCustomLighting) | 787 | Custom Function/subgraph, lighting, preview branch, keyword propagation | Nhánh khảo sát `6000.1` ghi URP 17.1+/Unity 6000.1+; bản cũ phải chọn nhánh khác. Nested subgraph keywords là failure case cụ thể |
| [Delt06/toon-rp](https://github.com/Delt06/toon-rp) | 565 | Tách outline screen-space và inverted hull; phân biệt shader với pipeline feature | Đây là custom SRP; README ghi early/not production-tested, Linear color space, Unity 2022.3.12f1/Core 14.0.9. Không cài thay URP để có toon |

README của cả tám repo được đọc tại commit cố định. Đã xem thêm source `.shader` và shared `.hlsl` của Nilo cùng `CustomLighting.hlsl` của Cyanilux. Các nhận xét còn lại ở mức README/metadata, không giả làm audit source toàn repo.

**Quyết định rút ra:** dùng Unity Graphics đúng version làm chuẩn kỹ thuật; Nilo cho bài tập HLSL; Cyanilux cho nhánh graph/custom lighting; các nguồn còn lại bổ sung cách thiết kế effect, điều khiển tham số và tình huống chống chọn sai pipeline. Không vendor repository hoặc gom hàng trăm shader vào context.

Nếu triển khai có copy/adapt code, trước hết đọc license thực của file/package và giữ notice/attribution tương ứng. License detection từ GitHub chỉ là dữ liệu khám phá; không tự cấp quyền cho texture, model, screenshot hay code thương mại nằm ngoài phần công khai.

## 3. Phạm vi và routing

Frontmatter dự kiến, cần đánh giá bằng tình huống thực trước khi thay canonical skill:

```yaml
name: unity-shader
description: Create, debug or optimize Unity Shader Graph and ShaderLab/HLSL shaders, including visual matching, pipeline passes, keywords and build variants. Use when shader behavior or source must change; route material-only tuning, whole VFX authoring and render-pipeline setup to their owners.
```

| Skill/owner | Trách nhiệm |
|---|---|
| `unity-shader` | Brief shader, chọn Graph/HLSL, shading math, pass contract, shader errors, variants và visual acceptance |
| `unity-material` | Chỉ đổi material/texture/property; shared vs instance ownership và runtime overrides |
| `unity-vfx-authoring` | Thiết kế cả effect, emitter/timeline/lifecycle/prefab; gọi shader branch khi cần |
| `unity-urp` / `unity-rendering` | Pipeline configuration, renderer feature, RenderGraph/render-pass integration |
| `unity-ui` / `unity-ui-reskin` | UI bindings/layout/font; phối hợp shader khi cần stencil, mask, clip hoặc alpha behavior |
| `unity-profiling` / mobile owner | Thu capture và xác minh bottleneck/device budget |
| Project/gameplay owner | Điều khiển thời gian/tham số và trạng thái gameplay có thẩm quyền |

MVP xử lý unlit/stylized lit, dissolve, Fresnel/rim, UV animation và vertex deformation cơ bản. Outline, depth fade, water, sprite/Canvas shader mở khi task cần và renderer hỗ trợ. Compute, ray tracing, volumetric framework, Shader Graph custom target và viết custom SRP là phần mở rộng riêng, không dồn vào MVP.

HDRP/Built-in không bị tự chuyển sang URP. Skill vẫn inspect/debug theo môi trường sẵn có; chỉ công bố mức authoring đã có pilot tương ứng. Không bắt có skill lân cận nếu preset không cài; dùng tool hiện có và nêu gap cụ thể.

## 4. Workflow mong muốn

### A. Xác định task và capability

1. Chọn author/debug/optimize; đọc owner và asset hiện có. Debug bắt đầu từ repro, shader compiler error và thay đổi gần nhất; optimize bắt đầu từ capture/baseline, không thiết kế lại art ngoài scope.
2. Đọc `ProjectVersion.txt`, manifest/lock, pipeline asset theo Graphics và Quality, renderer đang dùng, render path, color space, graphics API/platform. Phân biệt URP Forward/Forward+/Deferred và 2D Renderer khi liên quan; “có URP” chưa đủ để chọn shader.
3. Phát hiện khả năng Editor/bridge, tạo/mở graph, capture và build. Không đoán API nội bộ để author `.shadergraph`; dùng graph mẫu tương thích hoặc đường Editor đã xác minh. Nếu user yêu cầu Graph mà thiếu authoring capability, ghi gap; không âm thầm đổi sang HLSL rồi báo hoàn tất.

### B. Chốt brief shader và chọn kỹ thuật

Brief ngắn: bề mặt/renderer nào, silhouette và màu, ánh sáng, opacity, animation, tham số artist cần chỉnh, camera/background, target và tiêu chí chấp nhận. Với reference, tách phần do mesh/texture/light/post-processing khỏi phần shader có thể tái tạo. Ghi rõ điều chỉ suy đoán từ một ảnh.

- Giữ workflow Graph/HLSL đang có khi đáp ứng yêu cầu. Chọn Graph cho authoring node/subgraph phù hợp; HLSL khi cần kiểm soát pass hoặc logic chưa có đường graph tin cậy. Hybrid Custom Function cần kiểm tra signature, precision và preview theo version.
- Chọn opaque/alpha clip/transparent theo hình ảnh và sorting/depth cần thiết; nêu blend, ZWrite/ZTest, cull và queue có chủ đích.
- Xác định dữ liệu UV/object/world/screen space và texture import/color sampling; lỗi coordinate space hoặc alpha convention phải có case kiểm tra.
- Với outline, xác định shader hull hay screen-space feature; với refraction/depth fade, kiểm tra nguồn scene color/depth thực có. Không bật pipeline setting toàn project chỉ để demo chạy mà chưa đánh giá scope.
- Keyword hay uniform branch là quyết định theo feature usage, variants, divergence và đo đạc; không biến nhận xét performance trong tutorial thành quy tắc phổ quát.

### C. Author/debug bằng một mẫu nhỏ

- Tạo hoặc sửa asset đúng owner; giữ `.meta` GUID, property reference name, keyword và binding trừ khi migration có chủ đích. Reusable code vào package/shared module; game-specific glue vào `Assets/_Project` theo cấu trúc target.
- Với HLSL, đối chiếu include/function/LightMode và material buffer theo installed pipeline source. Lập bảng pass cần cho task: visible, shadow, depth/normals và deformation/alpha clip tương ứng. Không bắt mọi shader có mọi pass.
- Với Graph, giữ exposed property IDs, subgraph references và Custom Function dependencies; lưu/mở lại trong Editor. Preview node đúng chưa chứng minh Game view/player đúng.
- Material mẫu phơi bày tham số có đơn vị/range/default phù hợp; xác định owner update/reset/cleanup. Không mặc định `renderer.material`, MaterialPropertyBlock hay GPU instancing là lựa chọn tối ưu cho mọi batching path; kiểm tra đường render thực.
- Sửa một nguyên nhân đủ nhỏ rồi reimport/compile và xem compiler diagnostics. Không sửa shader generated cache hoặc cả package cache để che lỗi project source.

### D. Kiểm chứng và bàn giao

So sánh bằng camera, framing, light, exposure, background và resolution giữ cố định. Xem trạng thái biên: dissolve 0/giữa/1, opacity thấp, vật thể giao nhau, light/shadow bật tắt, animation và scale khi liên quan. Preview tĩnh không đủ chứng minh motion hoặc sorting.

Ghi riêng: asset import/save/reopen; shader compilation; hình ảnh; parameter isolation/lifecycle; player variants; device performance. Shader compiler/player logs và render output là bằng chứng riêng: C# compile pass không bảo đảm mọi pass/variant/API đã biên dịch và render.

Bàn giao danh sách file, cách gán shader/material và điều khiển tham số, capture so sánh, cấu hình đã thử, nguồn/license khi tái sử dụng, cùng từng gate `pass/fail/degraded/not-run`. Không báo “mobile optimized” từ Editor FPS hay số dòng HLSL giảm.

## 5. Cấu trúc skill dự kiến

```text
skills/unity-shader/
  SKILL.md
  references/
    authoring-and-visual-matching.md
    pipeline-and-passes.md
    shader-graph-and-custom-functions.md
    debugging-performance-and-variants.md
  assets/
    shader-brief.md
```

| File | Khi đọc / mục đích |
|---|---|
| `SKILL.md` | Scope, chọn mode, quyết định cốt lõi, verification và routing reference; mục tiêu 300–800 token, cap 5.000 byte |
| `authoring-and-visual-matching.md` | Khi tạo shader hoặc khớp reference: brief, phân rã appearance, vài recipe và acceptance có điều kiện |
| `pipeline-and-passes.md` | Khi đụng compatibility, lighting/depth/shadow/deformation; hướng dẫn tìm source đúng version, không chép một API cho mọi Unity |
| `shader-graph-and-custom-functions.md` | Khi dùng Graph/subgraph/Custom Function: serialization, property binding, preview, keywords và precision |
| `debugging-performance-and-variants.md` | Khi có lỗi hoặc bottleneck: repro, pink shader, build-only missing variant, overdraw, precision và capture |
| `shader-brief.md` | Template đầu ra dùng khi brief nhiều ràng buộc; không bắt điền dài cho một bug nhỏ |

Chưa thêm generator, shader template đa pipeline hay custom inspector. Chỉ bổ sung script sau khi pilot cho thấy một thao tác lặp lại có thể tự động hóa tin cậy. Không đưa code từ repo tham khảo vào assets trước khi chọn version và kiểm tra quyền phân phối.

## 6. Tích hợp toolkit khi triển khai

| Nơi thay đổi | Dự kiến |
|---|---|
| `skills/unity-shader/` | Thay entrypoint chung bằng workflow trên, thêm references/template |
| `skills/index.json` | Giữ tên/category/depth/priority/module; cập nhật description source, authoringProfile, references, evidence và eval IDs theo schema thực. Review lại maturity cho workflow mới; không kế thừa chữ `practitioner` làm bằng chứng đã pilot |
| Skill lân cận | Chỉ sửa routing hẹp nếu eval cho thấy overlap; giữ thay đổi VFX đang có của người dùng |
| `evals/catalog.json` | Positive, near-miss, conflict và missing-capability scenarios ở phần dưới |
| Source ledger | Khi triển khai, đưa nguồn thực dùng vào `docs/research/source-ledger.json` theo schema sẵn có; research snapshot hiện tại không thay compatibility registry |
| Installer coverage | Kiểm tra full preset install/update/uninstall đóng gói reference/template; update giữ file user-owned, không tạo sibling link bắt buộc thiếu ở preset khác |
| Docs/evidence | Hướng dẫn dùng ngắn, ví dụ, receipt có giới hạn từng nhánh; cập nhật catalog summary bằng script hiện có nếu nội dung registry đổi |

Không đổi toolkit version/phase, pipeline mặc định hoặc compatibility `tested` chỉ vì skill được viết xong. Không cài global, cấu hình hooks hoặc chạy model evaluation nền trong task lập plan.

## 7. Các mốc triển khai và tiêu chí hoàn tất

| Mốc | Kết quả cần có | Gate |
|---|---|---|
| P0 — Khóa phạm vi | Skill contract, target lab, resolved pipeline versions, pinned sources/license | Facts/contract/unknown riêng; có phương án khi thiếu Editor/Graph |
| P1 — Viết skill | Entry + bốn reference + brief | Scope rõ, dưới budget, links hợp lệ, không dùng API suy đoán |
| P2 — Nối toolkit | Registry, eval catalog, routing, packaging/docs | Preset hiện có resolve đúng; không trùng skill hoặc phá install ownership |
| P3 — Kiểm tra cấu trúc | Validation và test receipts | `npm test` pass; không dùng catalog check thay behavioral evaluation |
| P4 — Pilot Unity | HLSL dissolve, toon lit, Graph Custom Function | Import/save/reopen, compiler logs, visual captures và binding/parameter checks thực |
| P5 — Build/device theo claim | Player variant test; profile target khi cần | Build-only feature không bị strip sai; số đo có API/device/resolution/baseline |
| P6 — Review và bàn giao | Sửa từ lỗi đã quan sát, receipt/docs/diff | Trạng thái từng nhánh đúng bằng chứng, giữ mọi thay đổi ngoài scope |

P1–P3 có thể hoàn tất khi chưa có Unity lab nhưng chỉ chứng minh authoring/packaging của skill. P4 chưa chạy thì không tuyên bố skill đã tạo shader thành công. P5 là gate cho player/mobile/performance claims; một pilot URP không chứng minh HDRP/Built-in/API khác.

## 8. Pilot và eval hành vi

### Pilot Unity tối thiểu

| Pilot | Thiết lập | Tiêu chí quan sát |
|---|---|---|
| A — HLSL dissolve | URP, mesh có shadow; tham số 0/0.5/1 | Visible/shadow/depth liên quan nhất quán, edge ổn định, hai instance điều khiển độc lập |
| B — Toon lit | Main light, shadow và light phụ nếu brief cần | Đúng vùng sáng/tối, ramp/rim; outline thử riêng nếu thuộc scope; ghi rõ pass được render |
| C — Graph hybrid | Graph và Custom Function tương thích version | Mở/lưu/nạp lại được, preview và Game view đúng; đổi material property không mất binding |
| D — Player variants | Runtime bật feature không có trong material ban đầu | Player thật giữ variant cần dùng; không chỉ kiểm tra Editor hoặc SVC file tồn tại |
| E — Device theo claim | Device/API/tier/resolution đại diện, scene tải thực tế | Baseline/candidate captures; GPU time/overdraw/variants hoặc build cost đúng bottleneck; không đặt số ngân sách tùy tiện |

Chọn lab riêng và version ở P0; không thay pipeline của fixture vertical-slice hoặc project người dùng để chạy pilot. Built-in/HDRP/URP 2D/Canvas/XR có pilot bổ sung khi cần công bố hỗ trợ nhánh đó.

### Eval đề xuất

| ID | Tình huống | Hành vi đạt |
|---|---|---|
| `shader-author-dissolve` | Shader dissolve mobile từ mô tả chữ | Brief ngắn, đúng pipeline, shadow/depth nhất quán và không claim performance chưa đo |
| `shader-reference-toon` | Reference anime với ánh sáng phức tạp | Phân biệt mesh/texture/light/post, không hứa full NiloToon từ tutorial |
| `shader-graph-custom-lighting-version` | Unity 6000.0, tham khảo Cyanilux branch 6000.1 | Chọn nguồn phù hợp target hoặc nêu gap; không cài nhánh sai chỉ vì default branch |
| `shader-pink-repro` | Material hồng sau đổi renderer | Đọc shader errors và pipeline trước khi rewrite; sửa đúng nguyên nhân |
| `shader-build-keyword-stripping` | Editor đúng, player mất dissolve khi runtime bật keyword | Điều tra inclusion/stripping và verify player, không disable stripping toàn project theo mặc định |
| `shader-vertex-shadow-mismatch` | Mesh động nhưng shadow đứng yên | Kiểm tra deformation và pass liên quan theo pipeline |
| `shader-transparent-depth` | Shield sai sorting/depth fade | Xác minh blend/depth/source texture; không bật setting toàn cục theo phỏng đoán |
| `shader-urp-2d-lighting` | Shader phải nhận Light2D | Inspect 2D Renderer và shader path; không dùng 3D lit rồi suy ra hỗ trợ |
| `shader-ui-mask` | Shader Image bị lọt RectMask2D/stencil | Kiểm tra UI shader contract/Canvas thực; không chỉ chỉnh sorting layer |
| `shader-mobile-optimize` | Có GPU capture và yêu cầu giảm chi phí | Đổi đúng bottleneck, giữ visual acceptance, đo baseline/candidate cùng cấu hình |
| `shader-negative-material-only` | Chỉ đổi màu material | Route material; không tạo shader mới |
| `shader-negative-whole-vfx` | Tạo explosion có timeline/pooling | VFX authoring giữ quyền điều phối; shader chỉ là subtask nếu cần |
| `shader-conflict-no-upgrade` | Cấm đổi pipeline/package | Giữ constraint dù repo tham khảo yêu cầu version mới |
| `shader-graph-capability-missing` | User bắt buộc Graph nhưng tool chỉ sửa file | Không bịa graph API hoặc âm thầm đổi output contract |
| `shader-no-editor` | Chỉ có filesystem | Giao phần được scope cho phép; import/render/build ghi not-run với nguyên nhân |
| `shader-plan-only` | Chỉ yêu cầu thiết kế | Giao brief/plan, không sửa project hoặc cài dependency |

Quan sát quyết định và artifact thực; regex/keyword match hay sự tồn tại của shader file không đủ cho semantic pass. Evaluation không tự khởi chạy worker/model bên ngoài; dùng cơ chế được phép tại thời điểm triển khai.

## 9. Kiểm tra và bằng chứng

Khi triển khai skill, chạy kiểm tra theo thay đổi, tối thiểu trước khi đánh dấu phase hoàn tất:

```bash
npm test
git diff --check
git status --short
```

Chạy installer coverage riêng nếu thay packaging/ownership và cần chẩn đoán; không lặp toàn bộ suite khi không có thay đổi mới. Có thể dùng `quick_validate.py` của skill-creator nếu sẵn, nhưng không thay validator của toolkit.

Với lab đã chọn, sau khi cấu hình Editor thật:

```bash
node harness/dreamy-harness project-inspect /absolute/path/to/lab
node harness/dreamy-harness compile /absolute/path/to/lab
node harness/dreamy-harness console /absolute/path/to/lab
```

EditMode/PlayMode chỉ chạy khi có case chứng minh import/binding/lifecycle cần thiết. Không chạy batchmode tranh lock với Editor đang mở; khi đó dùng bridge/Editor workflow khả dụng. Shader compile diagnostics, render capture, player build và device profile cần thao tác/tool được phát hiện thực tế, không bịa operation harness.

Receipt cần source hashes, Editor revision, package lock, pipeline/renderer/path, graphics API, quality/color space, command/thao tác, log/capture và kết quả. Performance thêm hardware/resolution/workload/baseline/đơn vị; screenshot một trạng thái không chứng minh mọi variant.

## 10. Trạng thái bàn giao plan

Plan ban đầu đã được người dùng đồng ý triển khai. Đã nâng cấp canonical `unity-shader`, thêm bốn reference và brief, cập nhật registry/source ledger, thêm 16 eval catalog cases và installer lifecycle coverage. Giữ module/preset và các thay đổi VFX của người dùng. Không cài global hoặc thay đổi project game hiện có.

Kiểm tra cho lần lập plan: local Markdown links hợp lệ; research JSON parse được và có tám commit SHA cố định; `git diff --check` pass; `npm test` pass (143 passed, 1 skipped, 0 failed; validation 88 skills, 165 eval catalog cases, 6 size advisories). Đây là kiểm tra toolkit/tài liệu, không phải shader behavioral evaluation hoặc Unity verification.

Checkpoint triển khai: P0–P3 đã hoàn tất phần authoring/tích hợp/checks; P4 được thử trong lab riêng Unity 6000.4.12f1, URP/Shader Graph 17.4.0. Kết quả và giới hạn thực tế nằm trong [receipt](../evidence/unity-shader-validation.json). P5 player/device và semantic agent evaluation chưa được thực hiện; không suy ra support từ catalog pass.
