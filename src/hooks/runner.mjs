import fs from "node:fs";
import path from "node:path";
import { dispatch } from "./dispatcher.mjs";
import { resolvePolicy } from "./policy.mjs";
import {
  readJson,
  inside,
  dataRoot,
  atomicJson,
  hash,
} from "../lib/local-data.mjs";
const args = process.argv.slice(2),
  get = (k) => {
    const i = args.indexOf(k);
    return i < 0 ? undefined : args[i + 1];
  };
try {
  const policy = readJson(get("--policy"), { profile: "off" });
  const resolved = resolvePolicy(policy);
  const chunks = [];
  let size = 0;
  for await (const chunk of process.stdin) {
    size += chunk.length;
    if (size > resolved.maxInputBytes) throw Error("Oversized hook input");
    chunks.push(chunk);
  }
  const event = JSON.parse(Buffer.concat(chunks).toString("utf8")),
    root = path.resolve(get("--root") || event.cwd);
  if (policy.root && fs.realpathSync(policy.root) !== fs.realpathSync(root))
    throw Error("Policy root mismatch");
  const result = dispatch(event, { root, policy });
  if (result.output) process.stdout.write(JSON.stringify(result.output) + "\n");
  if (policy.recordReceipts) {
    atomicJson(
      inside(
        dataRoot(root),
        `hook-receipts/${hash(event.session_id + ":" + event.hook_event_name)}.json`,
      ),
      {
        schemaVersion: 1,
        event: event.hook_event_name,
        sessionId: event.session_id,
        observedAt: new Date().toISOString(),
        source: "native-or-explicit-invocation",
        metrics: result.metrics,
      },
    );
  }
  if (result.metrics.errors?.length)
    process.stderr.write(
      "Dreamy hook: handler degraded; run dreamy-kit hooks doctor\n",
    );
} catch (e) {
  process.stderr.write(
    `Dreamy hook skipped: ${e.name}. Check configuration and input limits.\n`,
  );
}
