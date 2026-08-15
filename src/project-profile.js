import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function hashFile(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function relative(root, file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

function walk(root, predicate, result = []) {
  if (!fs.existsSync(root)) return result;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (["Library", "Temp", "Logs", "obj", "Build", "Builds", "UserSettings"].includes(entry.name)) continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) walk(full, predicate, result);
    else if (entry.isFile() && predicate(full)) result.push(full);
  }
  return result;
}

function unityVersion(file) {
  if (!fs.existsSync(file)) return null;
  const match = fs.readFileSync(file, "utf8").match(/^m_EditorVersion:\s*(.+)$/m);
  return match?.[1]?.trim() ?? null;
}

function buildScenes(file) {
  if (!fs.existsSync(file)) return [];
  const text = fs.readFileSync(file, "utf8");
  const scenes = [];
  const pattern = /enabled:\s*(\d+)[\s\S]*?path:\s*([^\r\n]+)/g;
  for (const match of text.matchAll(pattern)) {
    scenes.push({ path: match[2].trim(), enabled: match[1] === "1" });
  }
  return scenes;
}

function asmdefInventory(projectRoot) {
  const files = walk(projectRoot, (file) => file.endsWith(".asmdef"));
  const records = [];
  const parseErrors = [];
  const editorAssemblies = new Set();
  const editorGuids = new Set();

  for (const file of files) {
    try {
      const data = readJson(file);
      const includePlatforms = data.includePlatforms ?? [];
      const isEditor = includePlatforms.includes("Editor") || relative(projectRoot, file).split("/").includes("Editor");
      const isTest = Boolean(data.optionalUnityReferences?.includes("TestAssemblies")) || /tests?/i.test(relative(projectRoot, file));
      const kind = isEditor ? "editor" : isTest ? "test" : "runtime";
      const record = {
        name: data.name ?? path.basename(file, ".asmdef"),
        path: relative(projectRoot, file),
        kind,
        references: data.references ?? [],
        includePlatforms,
        excludePlatforms: data.excludePlatforms ?? []
      };
      records.push(record);
      if (kind === "editor") {
        editorAssemblies.add(record.name);
        const metaFile = `${file}.meta`;
        if (fs.existsSync(metaFile)) {
          const guid = fs.readFileSync(metaFile, "utf8").match(/^guid:\s*([^\s]+)$/m)?.[1];
          if (guid) editorGuids.add(guid);
        }
      }
    } catch (error) {
      parseErrors.push(`${relative(projectRoot, file)}: ${error.message}`);
    }
  }

  const runtimeEditorViolations = records
    .filter((record) => record.kind === "runtime")
    .flatMap((record) => record.references
      .filter((reference) => reference === "UnityEditor" || editorAssemblies.has(reference) || (reference.startsWith("GUID:") && editorGuids.has(reference.slice(5))))
      .map((reference) => ({ assembly: record.name, reference })));

  return { records, parseErrors, runtimeEditorViolations };
}

function capability(packages, names) {
  const evidence = names.filter((name) => packages.some((pkg) => pkg.name === name));
  return { status: evidence.length ? "observed" : "not-observed", evidence };
}

function capabilityGraph(capabilities, dreamyPackages, renderPipeline) {
  const records = [];
  for (const [id, value] of Object.entries(capabilities)) {
    records.push({
      id,
      state: value.status === "observed" ? "detected" : "unknown",
      reasons: value.evidence ?? []
    });
  }
  for (const pkg of dreamyPackages) {
    records.push({
      id: pkg.name.replace(/^com\.dreamy\./, "dreamy-"),
      state: "detected",
      reasons: [pkg.name]
    });
  }
  if (renderPipeline.status === "observed") {
    records.push({
      id: renderPipeline.packages.includes("com.unity.render-pipelines.universal") ? "urp" : "render-pipeline",
      state: "detected",
      reasons: renderPipeline.packages.length ? renderPipeline.packages : ["ProjectSettings/GraphicsSettings.asset"]
    });
  }
  return records.sort((a, b) => a.id.localeCompare(b.id));
}

export function inspectProject(projectRoot, options = {}) {
  const root = path.resolve(projectRoot);
  const required = {
    manifest: path.join(root, "Packages", "manifest.json"),
    lock: path.join(root, "Packages", "packages-lock.json"),
    projectVersion: path.join(root, "ProjectSettings", "ProjectVersion.txt")
  };
  const optional = {
    graphicsSettings: path.join(root, "ProjectSettings", "GraphicsSettings.asset"),
    editorBuildSettings: path.join(root, "ProjectSettings", "EditorBuildSettings.asset")
  };
  const diagnostics = [];
  const missingRequired = Object.entries(required).filter(([, file]) => !fs.existsSync(file)).map(([name]) => name);
  for (const name of missingRequired) diagnostics.push(`Missing required Unity project source: ${name}`);

  let manifestDependencies = {};
  let lockDependencies = {};
  try {
    if (fs.existsSync(required.manifest)) manifestDependencies = readJson(required.manifest).dependencies ?? {};
  } catch (error) {
    diagnostics.push(`Invalid Packages/manifest.json: ${error.message}`);
  }
  try {
    if (fs.existsSync(required.lock)) lockDependencies = readJson(required.lock).dependencies ?? {};
  } catch (error) {
    diagnostics.push(`Invalid Packages/packages-lock.json: ${error.message}`);
  }

  const compatibilityFile = options.compatibilityFile;
  const compatibility = compatibilityFile && fs.existsSync(compatibilityFile)
    ? readJson(compatibilityFile).packages ?? {}
    : {};
  const packageNames = new Set([...Object.keys(manifestDependencies), ...Object.keys(lockDependencies)]);
  const lockDrift = Object.keys(manifestDependencies).filter((name) => !lockDependencies[name]);
  for (const name of lockDrift) diagnostics.push(`Package lock is missing declared dependency: ${name}`);
  const packages = [...packageNames].sort().map((name) => ({
    name,
    declaredVersion: manifestDependencies[name] ?? null,
    resolvedVersion: lockDependencies[name]?.version ?? null,
    source: lockDependencies[name]?.source ?? null,
    depth: lockDependencies[name]?.depth ?? null,
    hash: lockDependencies[name]?.hash ?? null,
    compatibilityStatus: name.startsWith("com.dreamy.") ? compatibility[name]?.status ?? "unknown" : "not-applicable"
  }));

  const asmdefs = asmdefInventory(root);
  diagnostics.push(...asmdefs.parseErrors.map((message) => `Invalid asmdef: ${message}`));
  diagnostics.push(...asmdefs.runtimeEditorViolations.map((item) => `Runtime assembly ${item.assembly} references Editor assembly ${item.reference}`));

  const packageNameList = packages.map((pkg) => pkg.name);
  const graphicsText = fs.existsSync(optional.graphicsSettings) ? fs.readFileSync(optional.graphicsSettings, "utf8") : "";
  const renderPipelinePackages = packageNameList.filter((name) => [
    "com.unity.render-pipelines.universal",
    "com.unity.render-pipelines.high-definition"
  ].includes(name));
  const pipelineFileId = graphicsText.match(/m_CustomRenderPipeline:\s*\{fileID:\s*(-?\d+)/)?.[1] ?? null;
  const activePipelineAssetConfigured = pipelineFileId !== null && pipelineFileId !== "0";

  const sourceFiles = { ...required, ...optional };
  const sourceHashes = Object.fromEntries(Object.entries(sourceFiles)
    .filter(([, file]) => fs.existsSync(file))
    .map(([name, file]) => [name, hashFile(file)]));
  const fatal = missingRequired.includes("manifest") || missingRequired.includes("projectVersion") || diagnostics.some((item) => item.startsWith("Invalid "));
  const incomplete = missingRequired.length > 0 || lockDrift.length > 0 || asmdefs.runtimeEditorViolations.length > 0;
  const engine = { name: missingRequired.includes("projectVersion") ? "unknown" : "unity", version: unityVersion(required.projectVersion) };
  const renderPipeline = {
    status: renderPipelinePackages.length || activePipelineAssetConfigured ? "observed" : "not-observed",
    packages: renderPipelinePackages,
    activePipelineAssetConfigured
  };
  const capabilities = {
    addressables: capability(packages, ["com.unity.addressables"]),
    inputSystem: capability(packages, ["com.unity.inputsystem"]),
    testFramework: capability(packages, ["com.unity.test-framework"]),
    uiToolkit: capability(packages, ["com.unity.modules.uielements"]),
    multiplayer: capability(packages, ["com.unity.netcode.gameobjects", "com.unity.entities"])
  };
  const dreamyPackages = packages.filter((pkg) => pkg.name.startsWith("com.dreamy."));
  const violations = [
    ...lockDrift.map((name) => ({ id: "package-lock-missing-dependency", severity: "warn", subject: name })),
    ...asmdefs.runtimeEditorViolations.map((item) => ({ id: "runtime-editor-reference", severity: "error", subject: item.assembly, reference: item.reference })),
    ...asmdefs.parseErrors.map((message) => ({ id: "asmdef-parse-error", severity: "error", subject: message }))
  ].sort((a, b) => `${a.id}:${a.subject}`.localeCompare(`${b.id}:${b.subject}`));

  return {
    schemaVersion: 2,
    observedAt: new Date().toISOString(),
    projectRoot: root,
    status: fatal ? "invalid" : incomplete ? "incomplete" : "valid",
    engine,
    unity: {
      version: engine.version,
      renderPipeline: renderPipeline.packages.includes("com.unity.render-pipelines.universal") ? "urp" : renderPipeline.packages.includes("com.unity.render-pipelines.high-definition") ? "hdrp" : activePipelineAssetConfigured ? "custom" : "unknown"
    },
    preset: "dreamy-project",
    packages,
    dreamyPackages,
    renderPipeline,
    asmdefs: {
      count: asmdefs.records.length,
      assemblies: asmdefs.records,
      runtimeEditorViolations: asmdefs.runtimeEditorViolations
    },
    buildScenes: buildScenes(optional.editorBuildSettings),
    capabilities,
    capabilityGraph: capabilityGraph(capabilities, dreamyPackages, renderPipeline),
    violations,
    confidence: {
      manifest: fs.existsSync(required.manifest) ? "detected" : "unknown",
      packagesLock: fs.existsSync(required.lock) ? "detected" : "unknown",
      unityVersion: engine.version ? "detected" : "unknown",
      asmdefs: asmdefs.parseErrors.length ? "partial" : "detected"
    },
    requiredSources: Object.fromEntries(Object.entries(required).map(([name, file]) => [name, fs.existsSync(file)])),
    sourceHashes,
    inputHashes: sourceHashes,
    diagnostics: diagnostics.sort()
  };
}
