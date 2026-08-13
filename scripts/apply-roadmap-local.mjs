import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

const dependencies = {
  foundation: [],
  "unity-core": ["foundation"],
  "unity-gameplay": ["foundation", "unity-core"],
  "unity-rendering": ["foundation", "unity-core"],
  "game-systems": ["foundation"],
  mobile: ["foundation", "unity-core"],
  production: ["foundation"],
  "dreamy-foundation": ["foundation"],
  "dreamy-packages": ["dreamy-foundation"],
  dreamy: ["foundation"]
};

for (const [id, deps] of Object.entries(dependencies)) {
  const file = `modules/${id}/module.json`;
  if (!fs.existsSync(path.join(root, file))) continue;
  const json = readJson(file);
  json.dependencies = deps;
  writeJson(file, json);
}

for (const file of fs.readdirSync(path.join(root, "agents", "codex")).filter((name) => name.endsWith(".toml"))) {
  const full = path.join(root, "agents", "codex", file);
  let text = fs.readFileSync(full, "utf8");
  if (!/^name\s*=/m.test(text)) {
    const name = file.replace(/\.toml$/, "").replaceAll("-", "_");
    text = `name = "${name}"\n${text}`;
    fs.writeFileSync(full, text);
  }
}

const toolkit = readJson("toolkit.json");
toolkit.version = "0.1.0-alpha.2";
toolkit.maturity = {
  ...toolkit.maturity,
  installer: "alpha.2-native-paths",
  agents: "alpha.2-native-schema",
  doctor: "alpha.2-diagnostics",
  evals: "alpha.2-static-runner",
  compatibility: "alpha.2-drift-report"
};
writeJson("toolkit.json", toolkit);

const pkg = readJson("package.json");
pkg.version = "0.1.0-alpha.2";
pkg.scripts["pack:smoke"] = "node scripts/pack-smoke.mjs";
writeJson("package.json", pkg);
