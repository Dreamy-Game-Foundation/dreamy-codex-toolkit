import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const start = "<!-- DREAMY-CATALOG:START -->";
const end = "<!-- DREAMY-CATALOG:END -->";
export function catalogSummary(root) {
  const read = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
  const kit = read("toolkit.json");
  return {
    skills: read(kit.skills).skills.length,
    agents: read(kit.agents).agents.length,
    rules: read(kit.rules).rules.length,
    modules: kit.modules.length,
    presets: kit.presets.length,
    evals: read(kit.evals).cases.length,
  };
}
export function reconcileCatalogDocs(root, { write = false } = {}) {
  const c = catalogSummary(root);
  const sections = {
    "README.md": `Catalog: **${c.skills} skills, ${c.agents} agent templates, ${c.rules} rules, ${c.modules} modules, ${c.presets} presets and ${c.evals} eval cases**. Counts describe the catalog, not measured model success.`,
    "docs/evals.md": `\`evals/catalog.json\` contains **${c.evals}** routing and safety case definitions. These are catalog definitions, not ${c.evals} observed model passes.`,
  };
  const stale = [];
  for (const [relative, content] of Object.entries(sections)) {
    const file = path.join(root, relative), text = fs.readFileSync(file, "utf8");
    if (text.split(start).length !== 2 || text.split(end).length !== 2 || text.indexOf(start) > text.indexOf(end)) throw Error(`Missing or malformed catalog markers: ${relative}`);
    const lineEnding = text.includes("\r\n") ? "\r\n" : "\n";
    const block = `${start}${lineEnding}${content}${lineEnding}${end}`;
    const next = text.slice(0, text.indexOf(start)) + block + text.slice(text.indexOf(end) + end.length);
    if (next === text) continue;
    stale.push(relative);
    if (write) fs.writeFileSync(file, next);
  }
  return { counts: c, stale };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some(a => !["--write", "--check"].includes(a)) || args.length > 1) throw Error("Use --write, --check or no arguments");
  const root = fileURLToPath(new URL("../", import.meta.url));
  const report = args.length ? reconcileCatalogDocs(root, { write: args[0] === "--write" }) : { counts: catalogSummary(root) };
  console.log(JSON.stringify(report));
  if (args[0] === "--check" && report.stale.length) process.exitCode = 1;
}
