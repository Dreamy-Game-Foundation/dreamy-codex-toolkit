import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseUnityTestResults, readUnityTestResults, maxTestResultBytes } from "../../src/lib/unity-test-results.mjs";

function report(results = ["Passed"], overrides = {}) {
  const attrs = {
    result: "Passed", total: results.length,
    passed: results.filter(r => r === "Passed").length,
    failed: results.filter(r => r === "Failed").length,
    skipped: results.filter(r => r === "Skipped").length,
    inconclusive: results.filter(r => r === "Inconclusive").length,
    ...overrides,
  };
  return `<test-run ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ")}><test-suite>${results.map(r => `<test-case name="probe" result="${r}"/>`).join("")}</test-suite></test-run>`;
}

test("NUnit results require executed successful tests and matching leaf counters", () => {
  for (const results of [["Passed"], ["Passed", "Passed"], ["Passed", "Skipped"]]) {
    const parsed = parseUnityTestResults(`<?xml version="1.0" encoding="utf-8"?>\n${report(results)}`);
    assert.equal(parsed.pass, true);
    assert.equal(parsed.counts.total, results.length);
  }
  // XML quoting, escaped output and CDATA must not confuse root/leaf detection.
  const xml = report().replace('result="Passed"', "result='Passed'").replace("</test-suite>", '<output><![CDATA[<test-run failed="0">]]></output></test-suite>');
  assert.equal(parseUnityTestResults(xml).pass, true);
});

const rejected = {
  "original skipped zero-test false pass": '<test-run result="Skipped" total="0" passed="0" failed="0" skipped="0" />',
  "empty passed run": report([]),
  "all skipped": report(["Skipped"], { result: "Skipped" }),
  "all skipped with Passed aggregate": report(["Skipped"]),
  "failed run": report(["Failed"], { result: "Failed" }),
  "inconclusive run": report(["Inconclusive"], { result: "Inconclusive" }),
  "failed result with zero failures": report(["Passed"], { result: "Failed" }),
  "missing result": report().replace('result="Passed"', ""),
  "missing counter": report().replace('inconclusive="0"', ""),
  "negative count": report(["Passed"], { total: -1 }),
  "non-integer count": report(["Passed"], { passed: "1.0" }),
  "unsafe integer": report(["Passed"], { total: "9007199254740992" }),
  "inconsistent aggregate": report(["Passed"], { total: 2 }),
  "invented successful test": report().replace('<test-case name="probe" result="Passed"/>', ""),
  "unreported failing leaf": report().replace('name="probe" result="Passed"', 'name="probe" result="Failed"'),
  "unknown leaf result": report().replace('name="probe" result="Passed"', 'name="probe" result="Unknown"'),
  "truncated XML": report().slice(0, -1),
  "duplicate attribute": report().replace('total="1"', 'total="1" total="1"'),
  "wrong root": `<wrapper>${report()}</wrapper>`,
  "multiple roots": report() + report(),
  "DOCTYPE": '<!DOCTYPE test-run SYSTEM "file:///etc/passwd">' + report(),
  "unknown entity": report().replace('name="probe"', 'name="&unknown;"'),
  "empty document": "",
};
for (const [name, xml] of Object.entries(rejected)) {
  test(`NUnit parser rejects ${name}`, () => {
    const parsed = parseUnityTestResults(xml);
    assert.equal(parsed.pass, false);
    assert.ok(parsed.reason);
  });
}

test("NUnit reader rejects missing/oversized results before reading them", t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-xml-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, "test.xml");
  assert.match(readUnityTestResults(file).reason, /unavailable/);
  assert.equal(readUnityTestResults(dir).pass, false);
  fs.writeFileSync(file, report());
  assert.equal(readUnityTestResults(file).pass, true);
  fs.truncateSync(file, maxTestResultBytes + 1);
  assert.match(readUnityTestResults(file).reason, /limit/);
});
