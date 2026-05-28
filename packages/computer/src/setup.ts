// `slock-computer setup <serverSlug>` — task #41 PR-J3.
//
// Thin orchestration over the existing primitives:
//   login → attach/adopt → start
//
// This command deliberately does not introduce a second server-side
// contract. It decides which primitive to call from local state, then lets
// that primitive own auth, preflight, credential hygiene, and lifecycle
// invariants.
import { chmod, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fetch } from "undici";
import { runAdoptLegacy } from "./adopt.js";
import { runAttach } from "./attach.js";
import { runLogin } from "./login.js";
import { fail, info } from "./output.js";
import { computerDir, resolveSlockHome, userSessionPath } from "./paths.js";
import { resolveServerUrl } from "./serverUrl.js";
import { formatServerSlugDisplay, resolveAttachedServerSlug } from "./serverState.js";
import { isProcessAlive, runStart } from "./supervisor.js";

interface UserSession {
  kind?: string;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
  serverUrl?: string;
  createdAt?: string;
}

const USER_SESSION_EXPIRY_LEEWAY_MS = 30_000;

export interface SetupOptions {
  serverSlug: string;
  serverUrl?: string;
  name?: string;
  adoptLegacy?: boolean;
  legacyApiKey?: string;
  legacyApiKeyFile?: string;
  legacyApiKeyStdin?: boolean;
  start?: boolean;
  foreground?: boolean;
  yes?: boolean;
}

interface SetupDeps {
  isTty?: boolean;
  runLogin?: typeof runLogin;
  runAttach?: typeof runAttach;
  runAdoptLegacy?: typeof runAdoptLegacy;
  runStart?: typeof runStart;
  refreshUserSession?: typeof refreshUserSession;
  hasLiveLegacyDaemon?: (slockHome: string) => Promise<boolean>;
}

export async function hasValidUserSession(slockHome: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(await readFile(userSessionPath(slockHome), "utf8")) as UserSession;
    return (
      parsed.kind === "user-session" &&
      typeof parsed.accessToken === "string" &&
      parsed.accessToken.length > 0 &&
      !isJwtExpired(parsed.accessToken)
    );
  } catch {
    return false;
  }
}

function isJwtExpired(token: string, nowMs = Date.now()): boolean {
  const [, payload] = token.split(".");
  if (!payload) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: unknown };
    // Refresh slightly before server-side expiry so setup does not race attach/adopt with
    // an access token that expires between the local preflight and the server request.
    return typeof parsed.exp === "number" && parsed.exp * 1000 <= nowMs + USER_SESSION_EXPIRY_LEEWAY_MS;
  } catch {
    // Non-JWT test/dev tokens are treated as unknown and left to the server.
    return false;
  }
}

export async function refreshUserSession(slockHome: string, serverUrl?: string): Promise<boolean> {
  const file = userSessionPath(slockHome);
  let session: UserSession;
  try {
    session = JSON.parse(await readFile(file, "utf8")) as UserSession;
  } catch {
    return false;
  }
  if (session.kind !== "user-session" || typeof session.refreshToken !== "string" || session.refreshToken.length === 0) {
    return false;
  }

  // Persist the effective server URL after refresh. If the operator passed
  // --server-url, subsequent setup attempts should keep using that server
  // instead of silently falling back to the stale saved session URL.
  const baseUrl = resolveServerUrl(serverUrl, session.serverUrl, process.env.SLOCK_SERVER_URL);
  const tmpFile = `${file}.${process.pid}.${Date.now()}.tmp`;
  try {
    const res = await fetch(new URL("/api/auth/refresh", baseUrl).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (res.status !== 200 || typeof body?.accessToken !== "string" || typeof body.refreshToken !== "string") {
      return false;
    }
    await mkdir(dirname(file), { recursive: true });
    await writeFile(
      tmpFile,
      JSON.stringify(
        {
          kind: "user-session",
          userId: session.userId,
          accessToken: body.accessToken,
          refreshToken: body.refreshToken,
          serverUrl: baseUrl,
          createdAt: session.createdAt ?? new Date().toISOString(),
          refreshedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      { mode: 0o600 },
    );
    await chmod(tmpFile, 0o600);
    await rename(tmpFile, file);
    return true;
  } catch {
    await rm(tmpFile, { force: true }).catch(() => undefined);
    return false;
  }
}

export async function hasLiveLegacyDaemon(slockHome: string): Promise<boolean> {
  let machineDirs: string[];
  try {
    machineDirs = await readdir(join(slockHome, "machines"));
  } catch {
    return false;
  }
  for (const name of machineDirs) {
    if (!name.startsWith("machine-")) continue;
    try {
      const raw = await readFile(join(slockHome, "machines", name, "daemon.lock", "owner.json"), "utf8");
      const owner = JSON.parse(raw) as { pid?: unknown };
      if (typeof owner.pid === "number" && isProcessAlive(owner.pid)) return true;
    } catch {
      // Corrupt/stale owner files are handled by the adoption primitive
      // when a key is supplied; setup only guards live legacy owners.
    }
  }
  return false;
}

function hasExplicitLegacyKeyInput(opts: SetupOptions): boolean {
  return (
    (typeof opts.legacyApiKey === "string" && opts.legacyApiKey.length > 0) ||
    (typeof opts.legacyApiKeyFile === "string" && opts.legacyApiKeyFile.length > 0) ||
    opts.legacyApiKeyStdin === true
  );
}

function hasAmbientLegacyKeyInput(): boolean {
  return typeof process.env.SLOCK_LEGACY_API_KEY === "string" && process.env.SLOCK_LEGACY_API_KEY.trim().length > 0;
}

export async function runSetup(opts: SetupOptions, deps: SetupDeps = {}): Promise<void> {
  const slockHome = resolveSlockHome();
  const isTty = deps.isTty ?? Boolean(process.stdin.isTTY && process.stdout.isTTY);
  const login = deps.runLogin ?? runLogin;
  const attach = deps.runAttach ?? runAttach;
  const adopt = deps.runAdoptLegacy ?? runAdoptLegacy;
  const start = deps.runStart ?? runStart;
  const refreshSession = deps.refreshUserSession ?? refreshUserSession;
  const legacyDaemonCheck = deps.hasLiveLegacyDaemon ?? hasLiveLegacyDaemon;

  if (!isTty && !opts.yes) {
    fail(
      "NON_INTERACTIVE_SETUP_REQUIRES_FLAGS",
      "Non-interactive setup requires --yes after you have confirmed the login/attach/adopt/start actions. Run `slock-computer login`, `slock-computer attach`, and `slock-computer start` separately for fully explicit automation.",
    );
  }

  if (!opts.adoptLegacy && hasExplicitLegacyKeyInput(opts)) {
    fail(
      "LEGACY_KEY_OUTSIDE_ADOPT",
      "`--legacy-api-key*` options are only accepted with `slock-computer setup --adopt-legacy` or `slock-computer adopt-legacy`.",
    );
  }

  const label = formatServerSlugDisplay(opts.serverSlug);
  info(`Setting up Slock Computer for ${label}…`);

  if (!(await hasValidUserSession(slockHome))) {
    if (await refreshSession(slockHome, opts.serverUrl)) {
      info("User session: refreshed.");
    } else {
      if (!isTty) {
        fail(
          "NON_INTERACTIVE_SETUP_REQUIRES_FLAGS",
          "No valid user session is available and setup is running non-interactively. Run `slock-computer login` in a terminal first, then re-run setup with --yes.",
        );
      }
      info("User session: missing or expired; starting login.");
      await login({ serverUrl: opts.serverUrl, orchestrated: true });
    }
  } else {
    info("User session: already logged in.");
  }

  let attachment = await resolveAttachedServerSlug(slockHome, opts.serverSlug);
  if (attachment) {
    info(`Attachment: already attached to ${label}.`);
  } else {
    const liveLegacy = await legacyDaemonCheck(slockHome);
    const explicitLegacyKey = hasExplicitLegacyKeyInput(opts);
    const hasLegacyKey = explicitLegacyKey || (opts.adoptLegacy === true && hasAmbientLegacyKeyInput());

    if (!opts.adoptLegacy && liveLegacy) {
      fail(
        "LEGACY_DAEMON_RUNNING",
        `A legacy daemon appears to be running in ${slockHome}, so Computer setup stopped before creating a second attachment. To proceed: try the Computer beta in an isolated home with \`SLOCK_HOME=$HOME/.slock-computer-beta slock-computer setup ${label}\`; or stop the legacy daemon with \`pkill -f slock-daemon && rm -f ~/.slock/daemon.pid\`; or migrate the existing daemon with \`--adopt-legacy --legacy-api-key <key>\`.`,
      );
    }

    if (opts.adoptLegacy && hasLegacyKey) {
      await adopt({
        serverSlug: opts.serverSlug,
        serverUrl: opts.serverUrl,
        name: opts.name,
        legacyApiKey: opts.legacyApiKey,
        legacyApiKeyFile: opts.legacyApiKeyFile,
        legacyApiKeyStdin: opts.legacyApiKeyStdin,
        orchestrated: true,
      });
    } else if (opts.adoptLegacy && liveLegacy) {
      fail(
        "LEGACY_DAEMON_RUNNING",
        `A legacy daemon is running in ${slockHome}, but no legacy key was provided. To proceed: provide --legacy-api-key-file/--legacy-api-key/--legacy-api-key-stdin to adopt it; or stop the legacy daemon with \`pkill -f slock-daemon && rm -f ~/.slock/daemon.pid\`; or use an isolated home with \`SLOCK_HOME=$HOME/.slock-computer-beta slock-computer setup ${label}\` for a clean beta trial.`,
      );
    } else {
      if (opts.adoptLegacy) {
        info("Legacy key: not provided; falling back to fresh device-login attach.");
      }
      await attach({
        serverSlug: opts.serverSlug,
        serverUrl: opts.serverUrl,
        name: opts.name,
        run: false,
        orchestrated: true,
      });
    }

    attachment = await resolveAttachedServerSlug(slockHome, opts.serverSlug);
    if (!attachment) {
      fail(
        "SETUP_ATTACHMENT_MISSING",
        `Setup did not produce a local attachment for ${label}. Re-run \`slock-computer attach ${label}\` or \`slock-computer adopt-legacy ${label}\`.`,
      );
    }
  }

  if (opts.start === false) {
    info(`Start: skipped (--no-start). Run \`slock-computer start ${label}\` when ready.`);
    return;
  }

  await start({
    serverId: attachment.serverId,
    serverLabel: opts.serverSlug,
    foreground: opts.foreground,
  });
}
