import fs from "node:fs";
import path from "node:path";
import { hash } from "./lib/local-data.mjs";
export const budgets = {
  bootstrap: 1600,
  session: 600,
  warning: 400,
  recall: 1000,
  checkpoint: 800,
  continuation: 480,
  task: 2000,
};
export function contextInventory(
  root,
  { preset = "dreamy-project", installedRoot = null } = {},
) {
  const toolkit = JSON.parse(fs.readFileSync(path.join(root, "toolkit.json"))),
    catalog = JSON.parse(fs.readFileSync(path.join(root, toolkit.skills)));
  const selected = new Set(),
    visited = new Set();
  function visit(id) {
    if (visited.has(id)) return;
    visited.add(id);
    const mod = JSON.parse(
      fs.readFileSync(path.join(root, "modules", id, "module.json")),
    );
    for (const dep of mod.dependencies || []) visit(dep);
    for (const c of mod.content)
      if (c.startsWith("skills/")) selected.add(`${c}/SKILL.md`);
  }
  if (!installedRoot)
    for (const id of JSON.parse(
      fs.readFileSync(path.join(root, "presets", `${preset}.json`)),
    ).modules)
      visit(id);
  const skills = [];
  for (const entry of catalog.skills) {
    const file = installedRoot
      ? path.join(installedRoot, entry.name, "SKILL.md")
      : path.join(root, entry.file);
    if (installedRoot ? !fs.existsSync(file) : !selected.has(entry.file))
      continue;
    const text = fs.readFileSync(file, "utf8"),
      front = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1],
      description = front.match(/^description:\s*(.+)$/m)?.[1] || "";
    skills.push({
      name: entry.name,
      metadataBytes: Buffer.byteLength(entry.name + description),
      bodyBytes: Buffer.byteLength(text),
      hash: hash(text),
    });
  }
  return {
    schemaVersion: 1,
    preset,
    selection: installedRoot ? "installed" : "preset-upper-bound",
    skills,
    metadataBytes: skills.reduce((n, s) => n + s.metadataBytes, 0),
    bodyBytes: skills.reduce((n, s) => n + s.bodyBytes, 0),
    tokens: null,
    measurement: "bytes-only",
    budgets,
  };
}
export function contextIssues(root) {
  const catalog = JSON.parse(
      fs.readFileSync(path.join(root, "skills/index.json")),
    ),
    errors = [],
    warnings = [];
  for (const e of catalog.skills) {
    const text = fs.readFileSync(path.join(root, e.file), "utf8");
    if (Buffer.byteLength(text) > 10000)
      errors.push(`${e.name}: entrypoint exceeds 10000 bytes`);
    else if (Buffer.byteLength(text) > 5000)
      warnings.push(`${e.name}: consider conditional references`);
    const dir = path.dirname(path.join(root, e.file));
    for (const m of text.matchAll(/(?:`|\()references\/([^`\s)]+)(?:`|\))/g))
      if (!fs.existsSync(path.join(dir, "references", m[1])))
        errors.push(`${e.name}: broken reference ${m[1]}`);
  }
  if (
    Buffer.byteLength(
      fs.readFileSync(path.join(root, "templates/AGENTS.managed.md")),
    ) > budgets.bootstrap
  )
    errors.push("Bootstrap template exceeds budget");
  return { errors, warnings };
}
