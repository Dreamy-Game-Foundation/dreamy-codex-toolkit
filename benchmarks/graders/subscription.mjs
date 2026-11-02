// Trusted oracle lives outside the editable workspace. This is a pure JS
// lifecycle contract, not proof of Unity C# or package API compatibility.
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { pathToFileURL } from "node:url";
import path from "node:path";
const { Panel } = await import(pathToFileURL(path.join(process.argv[2], "subscription.mjs")));
const source = new EventEmitter();
const panel = new Panel(source);
panel.open();
panel.open();
source.emit("reward");
assert.equal(panel.calls, 1, "open must be idempotent");
panel.close();
panel.close();
source.emit("reward");
assert.equal(panel.calls, 1, "closed panel must not receive events");
panel.open();
source.emit("reward");
assert.equal(panel.calls, 2, "reopen must attach exactly one handler");
panel.close();
assert.equal(source.listenerCount("reward"), 0, "panel must release its subscription");
console.log("subscription lifecycle: pass");
