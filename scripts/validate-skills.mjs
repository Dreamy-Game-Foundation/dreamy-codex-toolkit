import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const required = [
  "## Purpose",
  "## When To Use",
  "## When Not To Use",
  "## Domain Model",
  "## Required Inspection",
  "## Decision Tree",
  "## Workflow",
  "## Architecture Rules",
  "## Anti-patterns",
  "## Common Failure Modes",
  "## Verification",
  "## Allowed Claims",
  "## References"
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name === "SKILL.md") out.push(full);
  }
  return out;
}

const files = walk(path.join(root, "skills"));
const names = new Set();
const errors = [];
const compatibility = JSON.parse(fs.readFileSync(path.join(root, "compatibility", "dreamy-packages.json"), "utf8"));
const knownDreamyPackages = new Set(Object.keys(compatibility.packages ?? {}));
const skillIndex = JSON.parse(fs.readFileSync(path.join(root, "skills", "index.json"), "utf8"));
const indexedDepth = new Map((skillIndex.skills ?? []).map((skill) => [skill.file, skill]));
for (const file of files) {
  const rel = path.relative(root, file).replaceAll("\\", "/");
  const indexEntry = indexedDepth.get(rel);
  if (!indexEntry) errors.push(`${rel}: missing from skills/index.json`);
  else {
    if (!/^D[0-5]$/.test(indexEntry.depth ?? "")) errors.push(`${rel}: index missing valid depth`);
    if (!Array.isArray(indexEntry.owners) || indexEntry.owners.length === 0) errors.push(`${rel}: index missing owners`);
    if (!Array.isArray(indexEntry.requiresEvidence)) errors.push(`${rel}: index missing requiresEvidence`);
  }
  const text = fs.readFileSync(file, "utf8");
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) {
    errors.push(`${rel}: missing frontmatter`);
    continue;
  }
  const name = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  const requiredPackages = frontmatter[1].match(/^requires\.packages:\s*(\[.*\])\s*$/m)?.[1];
  if (!name) errors.push(`${rel}: missing name`);
  if (!description || description.length < 40) errors.push(`${rel}: description too short`);
  if (requiredPackages) {
    try {
      const packages = JSON.parse(requiredPackages);
      if (!Array.isArray(packages) || packages.some((pkg) => typeof pkg !== "string")) {
        errors.push(`${rel}: requires.packages must be a JSON string array`);
      }
      for (const pkg of packages) {
        if (pkg.startsWith("com.dreamy.") && !knownDreamyPackages.has(pkg)) {
          errors.push(`${rel}: requires.packages references unknown Dreamy package ${pkg}`);
        }
      }
    } catch {
      errors.push(`${rel}: requires.packages must be valid JSON`);
    }
  }
  if (name && names.has(name)) errors.push(`${rel}: duplicate skill name ${name}`);
  if (name) names.add(name);
  if (/The request directly touches this domain|Is there an existing owner or package capability|docs\/skill-authoring\.md/.test(text)) {
    errors.push(`${rel}: contains generic template routing text`);
  }
  if (/The task mentions guide/i.test(text)) {
    errors.push(`${rel}: generated when-to-use text is not polished`);
  }
  for (const match of text.matchAll(/`references\/([^`]+)`/g)) {
    const referencePath = path.join(path.dirname(file), "references", match[1]);
    if (!fs.existsSync(referencePath)) errors.push(`${rel}: missing referenced file references/${match[1]}`);
  }
  if (rel.includes("/dreamy/") || rel.includes("skills/unity-") || rel.includes("skills/gameplay/") || rel.includes("skills/systems/system-")) {
    for (const heading of required) {
      if (!text.includes(heading)) errors.push(`${rel}: missing ${heading}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`skill validation: OK (${files.length} skills)`);
