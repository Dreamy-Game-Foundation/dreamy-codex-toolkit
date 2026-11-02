import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { reconcileCatalogDocs } from "../../scripts/catalog-summary.mjs";

test("catalog docs detect drift, reconcile canonical counts and preserve surrounding bytes", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy catalog "));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "docs"));
  const data = {
    "toolkit.json": { skills: "skills.json", agents: "agents.json", rules: "rules.json", evals: "evals.json", modules: ["a"], presets: ["b", "c"] },
    "skills.json": { skills: [1, 2] }, "agents.json": { agents: [1] },
    "rules.json": { rules: [1, 2, 3] }, "evals.json": { cases: [1, 2, 3, 4] },
  };
  for (const [name, value] of Object.entries(data)) fs.writeFileSync(path.join(root, name), JSON.stringify(value));
  const original = "User prefix\r\n<!-- DREAMY-CATALOG:START -->\r\nold\r\n<!-- DREAMY-CATALOG:END -->\r\nUser suffix\r\n";
  for (const name of ["README.md", "docs/evals.md"]) fs.writeFileSync(path.join(root, name), original);
  assert.equal(reconcileCatalogDocs(root).stale.length, 2);
  assert.equal(fs.readFileSync(path.join(root, "README.md"), "utf8"), original);
  reconcileCatalogDocs(root, { write: true });
  assert.equal(reconcileCatalogDocs(root).stale.length, 0);
  const text = fs.readFileSync(path.join(root, "README.md"), "utf8");
  assert.ok(text.startsWith("User prefix\r\n"));
  assert.ok(text.endsWith("User suffix\r\n"));
  assert.match(text, /2 skills, 1 agent templates, 3 rules, 1 modules, 2 presets and 4 eval cases/);
  data["evals.json"].cases.push(5);
  fs.writeFileSync(path.join(root, "evals.json"), JSON.stringify(data["evals.json"]));
  assert.equal(reconcileCatalogDocs(root).stale.length, 2);
});
