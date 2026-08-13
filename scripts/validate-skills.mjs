import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const required = [
  "## Purpose",
  "## When To Use",
  "## When Not To Use",
  "## Required Inspection",
  "## Decision Tree",
  "## Workflow",
  "## Architecture Rules",
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
for (const file of files) {
  const rel = path.relative(root, file).replaceAll("\\", "/");
  const text = fs.readFileSync(file, "utf8");
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) {
    errors.push(`${rel}: missing frontmatter`);
    continue;
  }
  const name = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = frontmatter[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  if (!name) errors.push(`${rel}: missing name`);
  if (!description || description.length < 40) errors.push(`${rel}: description too short`);
  if (name && names.has(name)) errors.push(`${rel}: duplicate skill name ${name}`);
  if (name) names.add(name);
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
