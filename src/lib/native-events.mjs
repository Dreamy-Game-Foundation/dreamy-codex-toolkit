import path from "node:path";

export async function waitForHook(
  server,
  threadId,
  configPath,
  timeoutMs = 5000,
) {
  const deadline = Date.now() + timeoutMs;
  do {
    const runs = server.notifications
      .filter(
        (v) =>
          v.method === "hook/completed" &&
          v.params?.threadId === threadId &&
          typeof v.params.run?.sourcePath === "string" &&
          path.resolve(v.params.run.sourcePath) === configPath,
      )
      .map((v) => v.params.run);
    if (runs.some((r) => r.eventName === "sessionStart")) return runs;
    if (server.failure) throw server.failure;
    await new Promise((resolve) => setTimeout(resolve, 50));
  } while (Date.now() < deadline);
  return [];
}
