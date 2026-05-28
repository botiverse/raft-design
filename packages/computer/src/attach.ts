// `slock-computer attach <serverSlug>` — consume an existing USER session
// (written by `login`) to create/resume THIS machine's Computer
// attachment for one server, then run the §9 read-only preflight with
// the freshly-issued sk_computer_* BEFORE any local attachment state is
// committed (RFC v0.8 contract v3 §6/§9/§10).
//
// Fail-closed invariants:
//   - no user session → stop, tell the user to `login` first.
//   - attach rejected → uniform actionable error (server never leaks
//     existence; we don't either).
//   - preflight FAILS → ZERO local-state residue: attachment.json is
//     written ONLY after preflight passes. A failed preflight leaves the
//     filesystem exactly as it was.
//   - the sk_computer_* value lives ONLY in attachment.json (0600) — it
//     is never echoed to stdout/stderr (§3.3.1 key isolation).
//
// Daemon spawn (`--run` / `--foreground`) is intentionally NOT wired in
// this increment — it is a later #30 PR (PR-C/D). v0 here authorizes +
// writes local Computer state only; `--no-run` is the implemented path.
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { ComputerAttachClient } from "./apiClient.js";
import { deriveDefaultComputerName, resolveSlockHome, userSessionPath, serverAttachmentPath } from "./paths.js";
import { fail, info } from "./output.js";
import { formatServerSlugDisplay, normalizeServerSlug } from "./serverState.js";
import { resolveServerUrl } from "./serverUrl.js";

interface UserSession {
  kind?: string;
  userId?: string;
  accessToken?: string;
  serverUrl?: string;
}

export async function runAttach(opts: {
  serverSlug: string;
  serverUrl?: string;
  name?: string;
  run?: boolean;
  foreground?: boolean;
  orchestrated?: boolean;
}): Promise<void> {
  const slockHome = resolveSlockHome();
  const sessionFile = userSessionPath(slockHome);

  // Load the USER session written by `login`. Absent / unreadable →
  // fail closed with the actionable next step.
  let session: UserSession;
  try {
    session = JSON.parse(await readFile(sessionFile, "utf8")) as UserSession;
  } catch {
    fail(
      "NO_USER_SESSION",
      `No user session at ${sessionFile}. Run \`slock-computer login\` first.`,
    );
  }
  if (session.kind !== "user-session" || typeof session.accessToken !== "string" || !session.accessToken) {
    fail(
      "INVALID_USER_SESSION",
      `User session at ${sessionFile} is invalid. Re-run \`slock-computer login\`.`,
    );
  }

  // serverUrl precedence: --server-url > the URL the session logged into
  // > SLOCK_SERVER_URL. The session's serverUrl is the strongest implicit
  // default (the credential is scoped to that server).
  const baseUrl = resolveServerUrl(opts.serverUrl, session.serverUrl, process.env.SLOCK_SERVER_URL);

  const client = new ComputerAttachClient(baseUrl, session.accessToken);

  // Accept canonical `/<slug>` or shorthand `<slug>`. Wire/DB use the bare
  // form (matches `servers.slug`); the leading `/` is purely user-facing.
  const slugForServer = normalizeServerSlug(opts.serverSlug);
  if (!slugForServer) {
    fail("ATTACH_NOT_AUTHORIZED", "Server slug must not be empty.");
  }
  const computerName = opts.name?.trim() || deriveDefaultComputerName();
  info(`Attaching this machine to server ${formatServerSlugDisplay(slugForServer)}…`);
  const attached = await client.attach(slugForServer, computerName);
  if (attached.status === "disabled") {
    fail(
      "ATTACH_DISABLED",
      "Computer attach is not enabled on this server (ask an admin to unset SLOCK_DEVICE_LOGIN_ENABLED or set it back to a non-false value; this surface is on by default since PR-G — upgrade the server if you are on an older build).",
    );
  }
  if (attached.status === "not_authorized") {
    // Uniform — mirrors the server's zero-enumeration 403 (no signal
    // whether the server exists or you're just not a member).
    fail(
      "ATTACH_NOT_AUTHORIZED",
      "Not authorized to attach to that server. Check the server slug and that you're a member.",
    );
  }
  if (attached.status === "server_not_found") {
    fail(
      "ATTACH_SERVER_NOT_FOUND",
      `Server ${formatServerSlugDisplay(slugForServer)} was not found on ${baseUrl}. Check the slug spelling and --server-url, then retry.`,
    );
  }
  if (attached.status === "error") {
    if (attached.code === "session_invalid") {
      fail(
        "USER_SESSION_EXPIRED",
        "Your user session is no longer valid. Re-run `slock-computer login`.",
      );
    }
    if (attached.code === "request_failed") {
      fail(
        "ATTACH_REQUEST_FAILED",
        `Could not reach ${baseUrl} while attaching to ${formatServerSlugDisplay(slugForServer)}. Check --server-url / network connectivity, then retry.`,
      );
    }
    if (attached.code === "COMPUTER_NAME_COLLISION") {
      fail(
        "COMPUTER_NAME_COLLISION",
        `A Computer named ${JSON.stringify(computerName)} already exists on that server. Re-run with --name <name>.`,
      );
    }
    fail("ATTACH_FAILED", `Attach failed (${attached.code}). Re-run after checking --server-url / server version.`);
  }

  // attached.status === "success" — we now hold sk_computer_*. NOTHING is
  // persisted yet: run §9 preflight with it FIRST.
  info(attached.resumed ? "Resumed existing attachment; running preflight…" : "Attachment issued; running preflight…");
  const pre = await client.preflight(attached.apiKey);
  if (!pre.ok) {
    // Zero residue: we wrote no local state, so failing here leaves the
    // filesystem untouched. The server-side credential row is harmless
    // (a later re-attach resumes/rotates it).
    fail(
      "PREFLIGHT_FAILED",
      `Server preflight failed (${pre.code}). The server's Computer surface is not aligned; nothing was written locally. Upgrade the server or retry.`,
    );
  }

  // Preflight passed → commit local attachment state (0600), scoped to
  // THIS server's subtree (contract v4 §6/§9/§10: add-not-replace —
  // writing servers/<serverId>/ never touches another server's state).
  // The sk_computer_* lives ONLY here; never printed.
  const file = serverAttachmentPath(slockHome, attached.serverId);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(
    file,
    JSON.stringify(
      {
        kind: "computer-attachment",
        serverId: attached.serverId,
        serverSlug: attached.serverSlug,
        serverMachineId: attached.serverMachineId,
        apiKey: attached.apiKey,
        serverUrl: baseUrl,
        attachedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  // writeFile's mode only applies on create; force 0600 on the resume
  // (overwrite) path too so a rotated credential never widens perms.
  await chmod(file, 0o600);

  info(`Attached. Computer state written to ${file}`);
  info(`  server:        ${formatServerSlugDisplay(attached.serverSlug)}`);
  info(`  serverMachine: ${attached.serverMachineId}`);
  if (opts.orchestrated) {
    return;
  }
  if (opts.run === false) {
    info("Next: run `slock-computer start` to run it in the background.");
  } else {
    // `attach` writes local state only; the resident process is started
    // explicitly by `start` (its own lifecycle / pidfile). Auto-spawn on
    // attach is intentionally not coupled here.
    info("Next: run `slock-computer start` (background) — closing the terminal is fine.");
  }
}
