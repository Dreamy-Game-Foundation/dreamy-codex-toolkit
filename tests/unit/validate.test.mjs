import test from "node:test";
import assert from "node:assert/strict";
import { validate, readJson } from "../../scripts/validate.mjs";

test("catalog artifacts validate by invariant", async () => {
  const result = await validate();
  assert.ok(result.dreamyPackages > 0);
  assert.ok(result.repositories > 0);
  assert.ok(result.schemas > 0);
});

test("Dreamy package drift remains machine-visible", async () => {
  const compatibility = await readJson("compatibility/dreamy-packages.json");

  assert.equal(compatibility.packages["com.dreamy.dataconfig"].status, "drift");
  assert.match(compatibility.packages["com.dreamy.dataconfig"].drift.join("\n"), /UniTask/);

  assert.equal(compatibility.packages["com.dreamy.ui"].status, "drift");
  assert.match(compatibility.packages["com.dreamy.ui"].drift.join("\n"), /TextMeshPro/);

  assert.equal(compatibility.packages["com.dreamy.editor-tools"].status, "drift");
  assert.ok(compatibility.packages["com.dreamy.editor-tools"].unsupportedContracts.includes("No verified public headless API"));
});
