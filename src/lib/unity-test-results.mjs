import fs from "node:fs";
import { SaxesParser } from "saxes";

export const maxTestResultBytes = 32 * 1024 * 1024;

// NUnit 3 results emitted by Unity Test Framework. Parse the entire document:
// a successful-looking root alone says nothing about whether tests ran.
export function parseUnityTestResults(xml) {
  const reject = reason => ({ pass: false, reason, counts: null });
  if (Buffer.byteLength(xml) > maxTestResultBytes) return reject("Unity test XML exceeds the 32 MiB result limit");
  const parser = new SaxesParser();
  let root = null;
  let depth = 0;
  const leaves = { Passed: 0, Failed: 0, Skipped: 0, Inconclusive: 0 };
  try {
    parser.on("error", error => { throw error; });
    parser.on("doctype", () => { throw Error("DOCTYPE is unsupported in Unity test results"); });
    parser.on("opentag", tag => {
      if (++depth > 256) throw Error("Unity test XML exceeds the nesting limit");
      if (depth === 1) {
        if (tag.name !== "test-run") throw Error("Expected NUnit test-run root");
        root = tag.attributes;
      } else if (tag.name === "test-run") throw Error("Nested test-run is unsupported");
      if (tag.name === "test-case") {
        if (!Object.hasOwn(leaves, tag.attributes.result)) throw Error("Unknown or missing test-case result");
        leaves[tag.attributes.result]++;
      }
    });
    parser.on("closetag", () => { depth--; });
    parser.write(xml).close();
    if (!root) return reject("Unity test XML has no test-run root");
    const counts = {};
    for (const name of ["total", "passed", "failed", "skipped", "inconclusive"]) {
      const value = root[name];
      if (!/^(0|[1-9][0-9]*)$/.test(value ?? "") || !Number.isSafeInteger(Number(value))) {
        return reject(`Unity test XML has invalid or missing ${name} count`);
      }
      counts[name] = Number(value);
    }
    if (counts.total !== counts.passed + counts.failed + counts.skipped + counts.inconclusive ||
        counts.passed !== leaves.Passed || counts.failed !== leaves.Failed ||
        counts.skipped !== leaves.Skipped || counts.inconclusive !== leaves.Inconclusive) {
      return { pass: false, reason: "Unity test counters do not match the reported test cases", counts };
    }
    if (counts.total === 0 || counts.passed + counts.failed + counts.inconclusive === 0) {
      return { pass: false, reason: "Unity test run executed no tests (empty or all skipped)", counts };
    }
    if (root.result !== "Passed" || counts.failed !== 0 || counts.inconclusive !== 0) {
      return { pass: false, reason: `Unity test run did not pass (result=${root.result ?? "missing"})`, counts };
    }
    return { pass: true, reason: null, counts };
  } catch (error) {
    return reject(`Invalid Unity test XML: ${error.message}`);
  }
}

export function readUnityTestResults(file) {
  try {
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink()) return { pass: false, reason: "Unity test result must be a regular file", counts: null };
    if (stat.size > maxTestResultBytes) return { pass: false, reason: "Unity test XML exceeds the 32 MiB result limit", counts: null };
    return parseUnityTestResults(fs.readFileSync(file, "utf8"));
  } catch (error) {
    return { pass: false, reason: `Unity test result is unavailable: ${error.code ?? error.message}`, counts: null };
  }
}
