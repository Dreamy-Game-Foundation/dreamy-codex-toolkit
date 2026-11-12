# Shader Graph and Custom Functions

Read for Graph/subgraph work. The project decides Graph/HLSL; available tools do not silently change a required deliverable.

## Authoring capability

Read resolved Graph/pipeline versions, target/subtarget, exposed property reference names, subgraphs, function includes and material bindings. Inspect Editor/bridge capabilities. Old tutorial graphs may need migration; do not overwrite a working graph to test compatibility.

Prefer the existing graph, a matching installed sample/template or verified Editor-supported authoring. Do not synthesize graph JSON from guessed node IDs or assume internal GraphData APIs. If no verified route exists, preserve a required Graph constraint, prepare allowed brief/function work and report graph creation/import/render as not-run. Choose an alternative only when scope permits.

## Data contracts

- Inspect String versus File Custom Function mode. File mode needs the referenced include and signature expected by the installed generator. Precision suffix/port types must match; float-only code does not automatically support every half invocation.
- Name each input's coordinate space. Check normalization, texture/sampler inputs, include guards and helper ownership. Object/world vectors are not interchangeable because both have three components.
- Preview may lack scene lighting. Use the installed version's supported preview path and test Game view separately; preview fallback is not runtime lighting.
- Verify keyword declaration/propagation through nested subgraphs and the main graph. Runtime-only combinations need player inclusion/stripping checks, not just blackboard configuration.
- Keep property reference names/types, GUIDs and subgraph bindings stable. Display label and serialized reference renames differ. A migration must identify dependent materials, animations and scripts.

For custom lighting, identify main/additional light, shadow, fog and baked-lighting needs from the brief. Check installed source for loops/keywords; do not paste Forward+ keywords from another URP version. Built-in nodes may already provide the required path.

## Verification

Import/compile, save and reopen/reload via supported Editor operations; verify material shader/property references survive. Inspect shader diagnostics and render a representative object at controlled values. Test independent materials/instances where relevant. Preview or C# compilation alone does not prove target shader compilation.

Deliver subgraphs, function source and texture dependencies. Do not deliver cache edits. For vendor samples in a lab, record version/hash and preserve GUID dependencies; keep them out of the distributed toolkit unless redistribution is intentionally reviewed.

## Source boundary

[Cyanilux README](https://github.com/Cyanilux/URP_ShaderGraphCustomLighting/blob/19fac6a6126a9c25d8f226b38bb12c7360557ff6/README.md) and [CustomLighting.hlsl](https://github.com/Cyanilux/URP_ShaderGraphCustomLighting/blob/19fac6a6126a9c25d8f226b38bb12c7360557ff6/CustomLighting.hlsl), inspected 2026-11-03, describe a URP 17.1+/Unity 6000.1+ branch and nested-subgraph keyword caveat. Check those contracts; do not assume identical behavior in every version. Select older branches from verified target evidence instead of importing this branch into Unity 6000.0.
