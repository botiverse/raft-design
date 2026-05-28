// Per-server attachment state accessor (RFC v0.8 contract v4 §1/§10).
//
// A Computer (= one SLOCK_HOME) holds N independent per-server
// attachments under `computer/servers/<serverId>/`. This module is the
// single reader of that set — every aggregate surface (status, the
// supervisor, doctor) lists/loads through here so the "one Computer
// manages all connections under its SLOCK_HOME" contract has exactly
// one implementation. Per-server isolation (§5): loading server X never
// reads server Y.
import { readFile, readdir, writeFile, mkdir, unlink, access, chmod } from "node:fs/promises";
import { dirname } from "node:path";
import { constants as fsConstants } from "node:fs";
import {
  isValidServerId,
  serversDir,
  serverAttachmentPath,
  serverManagedFlagPath,
} from "./paths.js";

export interface ServerAttachment {
  kind: "computer-attachment";
  serverId: string;
  serverSlug?: string;
  serverMachineId: string;
  apiKey: string;
  serverUrl: string;
  attachedAt?: string;
}

function parseAttachment(raw: string): ServerAttachment | null {
  try {
    const a = JSON.parse(raw) as Record<string, unknown>;
    if (
      a.kind === "computer-attachment" &&
      typeof a.serverId === "string" &&
      typeof a.serverMachineId === "string" &&
      typeof a.apiKey === "string" &&
      a.apiKey.length > 0 &&
      typeof a.serverUrl === "string"
    ) {
      return {
        kind: "computer-attachment",
        serverId: a.serverId,
        serverSlug: typeof a.serverSlug === "string" && a.serverSlug.length > 0 ? a.serverSlug : undefined,
        serverMachineId: a.serverMachineId,
        apiKey: a.apiKey,
        serverUrl: a.serverUrl,
        attachedAt: typeof a.attachedAt === "string" ? a.attachedAt : undefined,
      };
    }
  } catch {
    /* fall through */
  }
  return null;
}

/** Read one server's attachment, or null if absent/invalid. */
export async function readServerAttachment(
  slockHome: string,
  serverId: string,
): Promise<ServerAttachment | null> {
  if (!isValidServerId(serverId)) return null;
  try {
    return parseAttachment(await readFile(serverAttachmentPath(slockHome, serverId), "utf8"));
  } catch {
    return null;
  }
}

/** Rewrite one attachment.json while preserving the serverId-keyed path. */
export async function writeServerAttachment(
  slockHome: string,
  attachment: ServerAttachment,
): Promise<void> {
  if (!isValidServerId(attachment.serverId)) return;
  const path = serverAttachmentPath(slockHome, attachment.serverId);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(attachment, null, 2), { mode: 0o600 });
  await chmod(path, 0o600);
}

/**
 * The serverIds this Computer is attached to (a valid-UUID subdir of
 * `servers/` that contains a parseable attachment.json). Sorted for
 * stable output. Never throws — a missing `servers/` dir = [].
 */
export async function listAttachedServerIds(slockHome: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await readdir(serversDir(slockHome));
  } catch {
    return [];
  }
  const ids: string[] = [];
  for (const name of entries) {
    if (!isValidServerId(name)) continue;
    if (await readServerAttachment(slockHome, name)) ids.push(name);
  }
  return ids.sort();
}

/** All attachments, in stable serverId order. */
export async function listServerAttachments(slockHome: string): Promise<ServerAttachment[]> {
  const ids = await listAttachedServerIds(slockHome);
  const out: ServerAttachment[] = [];
  for (const id of ids) {
    const a = await readServerAttachment(slockHome, id);
    if (a) out.push(a);
  }
  return out;
}

/**
 * Normalize a user-supplied server-slug input. The canonical user-facing
 * mental model is `/<slug>` (parallel to `@<handle>` for personal-server
 * namespace, locked tygg msg=1dbc346d / Jianwei msg=8e9116d7 in
 * `#wg-slock-computer:a0997b57`). The CLI accepts both `/aa` and `aa`;
 * stored slug is the bare form (matches `servers.slug` in the DB).
 *
 * Strips at most ONE leading `/` plus surrounding whitespace. Multiple
 * slashes / a full URL path are not a compatibility input — those fail
 * the lookup downstream. Returns `""` when the input is empty/blank.
 */
export function normalizeServerSlug(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
}

/** Render a slug in the canonical `/<slug>` form for help text and errors. */
export function formatServerSlugDisplay(slug: string | null | undefined): string {
  if (!slug) return "(unknown slug; re-run attach or doctor)";
  return slug.startsWith("/") ? slug : `/${slug}`;
}

/**
 * Resolve a user-facing server slug to the canonical serverId stored on
 * disk. Disk layout remains `servers/<serverId>/` so a server rename does
 * not move local credential/pid/log state. We intentionally do NOT accept
 * UUIDs as compatibility aliases here; the CLI surface is slug-only.
 *
 * Both `/aa` and `aa` resolve to the same attachment via `normalizeServerSlug`.
 */
export async function resolveAttachedServerSlug(
  slockHome: string,
  serverSlug: string,
): Promise<ServerAttachment | null> {
  const requested = normalizeServerSlug(serverSlug);
  if (!requested) return null;
  const attachments = await listServerAttachments(slockHome);
  return attachments.find((a) => a.serverSlug === requested) ?? null;
}

// --- managed-flag state (contract v4 §6 line 80) ---
//
// The supervisor reconciles its set of daemon children against the set
// of server IDs that have BOTH an attachment AND a managed.flag file.
// `attach` establishes the credential without setting managed. `start`
// sets managed for one (with serverId) or all attached (without). detach
// clears managed (and then the attachment + revokes server-side).

/** Set the managed-flag for a server. Caller must ensure the server dir
 * exists (typically via attach). Idempotent: writing twice is OK. */
export async function setServerManaged(slockHome: string, serverId: string): Promise<void> {
  if (!isValidServerId(serverId)) return;
  const flagPath = serverManagedFlagPath(slockHome, serverId);
  await mkdir(dirname(flagPath), { recursive: true });
  await writeFile(flagPath, "", { mode: 0o600 });
}

/** Clear the managed-flag for a server. Idempotent: missing file is fine. */
export async function clearServerManaged(slockHome: string, serverId: string): Promise<void> {
  if (!isValidServerId(serverId)) return;
  try {
    await unlink(serverManagedFlagPath(slockHome, serverId));
  } catch {
    /* already cleared */
  }
}

/** True iff the managed-flag file exists for that server. */
export async function isServerManaged(slockHome: string, serverId: string): Promise<boolean> {
  if (!isValidServerId(serverId)) return false;
  try {
    await access(serverManagedFlagPath(slockHome, serverId), fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/** The serverIds that are both attached AND managed — i.e., the set the
 * supervisor should keep daemons running for. Sorted for stable output. */
export async function listManagedServerIds(slockHome: string): Promise<string[]> {
  const attached = await listAttachedServerIds(slockHome);
  const out: string[] = [];
  for (const id of attached) {
    if (await isServerManaged(slockHome, id)) out.push(id);
  }
  return out;
}
