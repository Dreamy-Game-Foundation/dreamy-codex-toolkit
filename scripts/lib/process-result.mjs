export function parseProcessJson(result, label, expectedCode = 0) {
  if (result.error)
    throw new Error(
      `${label}: spawn failed (${result.error.code ?? "unknown"}): ${result.error.message}`,
    );
  if (result.signal || result.status !== expectedCode)
    throw new Error(
      `${label}: exit ${result.status}, signal ${result.signal ?? "none"}, expected ${expectedCode}; ${String(result.stderr ?? "").slice(0, 500)}`,
    );
  if (!String(result.stdout ?? "").trim())
    throw new Error(`${label}: empty JSON output`);
  try {
    return JSON.parse(result.stdout);
  } catch (e) {
    throw new Error(`${label}: invalid JSON: ${e.message}`);
  }
}
