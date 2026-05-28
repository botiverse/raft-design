// `slock-computer runners list|stop` — control-plane runner ops, scoped
// to one attached server (RFC v0.8 §12, contract v4 §6).
//
// The §12 whitelist is enforced SERVER-SIDE; this client renders exactly
// what the server returned. The sk_computer_* (loaded per-server) is
// used ONLY as a bearer — never printed.
//
// Server selection rule (v4 §6, locked): exactly 1 attached server →
// allowed to omit `--server`; ≥2 → `--server <slug>` required (fail-loud
// list candidates). No implicit "current server" ambient state.
import { RunnersClient } from "./apiClient.js";
import { resolveTargetAttachment } from "./targetServer.js";
import { fail, info } from "./output.js";
import { formatServerSlugDisplay } from "./serverState.js";

export async function runRunnersList(opts: {
  json?: boolean;
  server?: string | null;
}): Promise<void> {
  const a = await resolveTargetAttachment({ server: opts.server });
  const client = new RunnersClient(a.serverUrl, a.apiKey);
  const result = await client.list();
  // User-facing label: canonical `/<slug>` for known slug; serverId only
  // as a transitional fallback for pre-PR-G attachments not yet refreshed.
  const label = a.serverSlug ? formatServerSlugDisplay(a.serverSlug) : a.serverId;

  if (result.status === "unauthorized") {
    fail(
      "RUNNERS_UNAUTHORIZED",
      `The Computer credential for ${label} was rejected. Re-run \`slock-computer attach ${label}\`.`,
    );
  }
  if (result.status === "error") {
    fail(
      "RUNNERS_LIST_FAILED",
      `Could not list runners on ${label} (${result.code}). Check --server-url / server version.`,
    );
  }

  if (opts.json) {
    info(
      JSON.stringify(
        { server: label, serverId: a.serverId, whitelist: result.whitelist, runners: result.runners },
        null,
        2,
      ),
    );
    return;
  }
  if (result.runners.length === 0) {
    info(`No runners on server ${label}.`);
    return;
  }
  info("");
  info(`Server ${label}:`);
  info("  AGENT                                 STATUS     RUNTIME   MODEL          NAME");
  for (const r of result.runners) {
    info(
      `  ${r.agentId.padEnd(38)}${(r.status ?? "").padEnd(11)}${(r.runtime ?? "").padEnd(10)}${(r.model ?? "").padEnd(15)}${r.name ?? ""}`,
    );
  }
  info("");
}

export async function runRunnersStop(
  agentId: string,
  opts: { server?: string | null } = {},
): Promise<void> {
  if (!agentId || agentId.trim().length === 0) {
    fail("AGENT_ID_REQUIRED", "Usage: slock-computer runners stop <agentId> [--server /<serverSlug>]");
  }
  const a = await resolveTargetAttachment({ server: opts.server });
  const client = new RunnersClient(a.serverUrl, a.apiKey);
  const result = await client.stop(agentId);
  // User-facing label: canonical `/<slug>` for known slug; serverId only
  // as a transitional fallback for pre-PR-G attachments not yet refreshed.
  const label = a.serverSlug ? formatServerSlugDisplay(a.serverSlug) : a.serverId;

  if (result.status === "unauthorized") {
    fail(
      "RUNNERS_UNAUTHORIZED",
      `The Computer credential for ${label} was rejected. Re-run \`slock-computer attach ${label}\`.`,
    );
  }
  if (result.status === "not_found") {
    fail("RUNNER_NOT_FOUND", `No runner ${agentId} on server ${label}.`);
  }
  if (result.status === "error") {
    fail(
      "RUNNER_STOP_FAILED",
      `Could not stop runner on ${label} (${result.code}). Check --server-url / server version.`,
    );
  }
  info(`Stop signalled for runner ${agentId} on server ${label}.`);
}
