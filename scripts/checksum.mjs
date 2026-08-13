import crypto from "node:crypto";
import fs from "node:fs";

const file = process.argv[2];
if (!file || !fs.existsSync(file)) {
  console.error("Usage: node scripts/checksum.mjs <file>");
  process.exit(2);
}
const hash = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
console.log(`${hash}  ${file}`);
