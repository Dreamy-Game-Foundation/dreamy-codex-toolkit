import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const version = JSON.parse(fs.readFileSync(path.join(root, "toolkit.json"), "utf8")).version;
const file = path.join(root, "CHANGELOG.md");
let text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "# Changelog\n";

if (!text.includes(`## ${version}`)) {
  text = `${text.trimEnd()}\n\n## ${version}\n\n- Release notes pending.\n`;
  fs.writeFileSync(file, text, "utf8");
  console.log(`added changelog entry for ${version}`);
} else {
  console.log(`changelog entry exists for ${version}`);
}
