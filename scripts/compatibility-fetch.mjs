import fs from "node:fs";
import path from "node:path";
import { readJson, root, sha256File } from "./compatibility-lib.mjs";

const dreamy = readJson("compatibility/dreamy-packages.json");
const thirdParty = readJson("compatibility/third-party.json");
const evidence = {
  schemaVersion: 1,
  evidenceRetrievedAt: null,
  fetchedAt: new Date().toISOString(),
  fetchMethod: "committed-registry-snapshot",
  upstreamFetchPerformed: false,
  note: "This snapshot hashes committed compatibility records only; it does not refresh upstream package evidence.",
  sources: {
    dreamyPackages: {
      path: "compatibility/dreamy-packages.json",
      hash: sha256File("compatibility/dreamy-packages.json"),
      packages: Object.keys(dreamy.packages ?? {}).length
    },
    thirdParty: {
      path: "compatibility/third-party.json",
      hash: sha256File("compatibility/third-party.json"),
      packages: Object.keys(thirdParty.packages ?? {}).length
    }
  }
};

fs.mkdirSync(path.join(root, "release"), { recursive: true });
fs.writeFileSync(path.join(root, "release", "compatibility-evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify({ status: "ok", upstreamFetchPerformed: false, sources: Object.keys(evidence.sources).length }));
