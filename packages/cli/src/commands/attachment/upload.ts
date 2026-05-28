// `slock attachment upload --path <filepath> [--channel <target>]`
// → POST /internal/agent/:id/resolve-channel  (target → channelId, when --channel given)
// → POST /internal/agent/:id/upload           (multipart: file + channelId)
//
// Returns the attachment id; pass it to `slock message send --attachment-id`.
//
// Note: v0 server's /upload endpoint still requires a channelId in the multipart
// body. The CLI surface no longer requires --channel (per locked v0 spec), but
// callers that omit it will hit MISSING_CHANNEL until the server accepts
// channel-less uploads. Tracked separately.

import { existsSync, statSync, readFileSync } from "node:fs";
import { basename } from "node:path";

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";

export const MAX_ATTACHMENT_UPLOAD_BYTES = 50 * 1024 * 1024;
export const MAX_ATTACHMENT_UPLOAD_LABEL = "50MB";
const FILENAME_MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".json": "application/json",
  ".csv": "text/csv",
};
const MIME_TYPE_RE = /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i;

interface UploadOpts {
  path: string;
  channel?: string;
  mimeType?: string;
}

interface ResolveChannelResp {
  channelId?: string;
}

interface UploadResp {
  id: string;
  filename: string;
  mimeType: string | null;
  sizeBytes: number;
  thumbnailUrl: string | null;
}

export class AttachmentUploadArgError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AttachmentUploadArgError";
  }
}

function inferMimeTypeFromFilename(filename: string): string | null {
  const index = filename.lastIndexOf(".");
  const ext = index >= 0 ? filename.slice(index).toLowerCase() : "";
  return FILENAME_MIME_MAP[ext] || null;
}

function inferMimeTypeFromBuffer(buffer: Buffer): string | null {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))
  ) {
    return "image/png";
  }
  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(Buffer.from([0xFF, 0xD8, 0xFF]))) {
    return "image/jpeg";
  }
  if (buffer.length >= 6) {
    const header = buffer.subarray(0, 6).toString("ascii");
    if (header === "GIF87a" || header === "GIF89a") return "image/gif";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function normalizeExplicitMimeType(mimeType: string | null | undefined): string | null {
  const normalized = mimeType?.trim().toLowerCase();
  if (!normalized) return null;
  if (!MIME_TYPE_RE.test(normalized)) {
    throw new AttachmentUploadArgError(
      "INVALID_ARG",
      `--mime-type must look like type/subtype, got: ${mimeType}`,
    );
  }
  return normalized;
}

export function inferUploadMimeType(
  filename: string,
  buffer: Buffer,
  explicitMimeType?: string | null,
): string {
  const explicit = normalizeExplicitMimeType(explicitMimeType);
  return explicit
    || inferMimeTypeFromBuffer(buffer)
    || inferMimeTypeFromFilename(filename)
    || "application/octet-stream";
}

export function validateUploadFileSize(size: number): void {
  if (size > MAX_ATTACHMENT_UPLOAD_BYTES) {
    throw new AttachmentUploadArgError(
      "INVALID_ARG",
      `--path is ${formatBytes(size)}; max upload size is ${MAX_ATTACHMENT_UPLOAD_LABEL}`,
    );
  }
  if (size === 0) {
    throw new AttachmentUploadArgError(
      "INVALID_ARG",
      "--path is empty; refusing to upload a 0-byte attachment",
    );
  }
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0B";
  const units = ["B", "KB", "MB", "GB"] as const;
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)}${units[unitIndex]}`;
}

export function registerAttachmentUploadCommand(parent: Command): void {
  parent
    .command("upload")
    .description(`Upload a local file as an attachment (max ${MAX_ATTACHMENT_UPLOAD_LABEL})`)
    .requiredOption("--path <filepath>", "Absolute path to the local file to upload")
    .option(
      "--channel <target>",
      "Target where the attachment will be used: '#channel', 'dm:@peer', or thread variants. Required by the v0 server until channel-less uploads land.",
    )
    .option("--mime-type <type>", "Explicit MIME type override, e.g. image/png")
    .action(async (opts: UploadOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      if (!existsSync(opts.path)) {
        fail("INVALID_ARG", `--path does not exist: ${opts.path}`);
      }
      const stat = statSync(opts.path);
      if (!stat.isFile()) {
        fail("INVALID_ARG", `--path is not a regular file: ${opts.path}`);
      }
      try {
        validateUploadFileSize(stat.size);
      } catch (err) {
        if (err instanceof AttachmentUploadArgError) fail(err.code, err.message);
        throw err;
      }

      if (!opts.channel) {
        fail(
          "MISSING_CHANNEL",
          "v0 server requires a channel to attach the upload to. Pass --channel '#name', 'dm:@peer', or a thread target.",
        );
      }

      const client = new ApiClient(ctx);
      const agentPath = `/internal/agent/${encodeURIComponent(ctx.agentId)}`;

      const resolved = await client.request<ResolveChannelResp>(
        "POST",
        `${agentPath}/resolve-channel`,
        { target: opts.channel },
      );
      if (!resolved.ok || !resolved.data?.channelId) {
        const code = resolved.status >= 500 ? "SERVER_5XX" : "RESOLVE_FAILED";
        fail(code, resolved.error ?? `Could not resolve channel: ${opts.channel}`);
      }
      const channelId = resolved.data!.channelId!;

      const buffer = readFileSync(opts.path);
      const filename = basename(opts.path);
      let explicitMimeType: string | null;
      try {
        explicitMimeType = normalizeExplicitMimeType(opts.mimeType);
      } catch (err) {
        if (err instanceof AttachmentUploadArgError) fail(err.code, err.message);
        throw err;
      }
      const uploadMimeType = inferUploadMimeType(filename, buffer, explicitMimeType);
      const blob = new Blob([buffer], { type: uploadMimeType });
      const form = new FormData();
      form.append("file", blob, filename);
      form.append("channelId", channelId);
      if (explicitMimeType) {
        form.append("mimeType", explicitMimeType);
      }

      const res = await client.requestMultipart<UploadResp>(
        "POST",
        `${agentPath}/upload`,
        form,
      );
      if (!res.ok) {
        const code = res.status >= 500 ? "SERVER_5XX" : "UPLOAD_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }
      const d = res.data!;
      process.stdout.write(`File uploaded: ${d.filename} (${(d.sizeBytes / 1024).toFixed(1)}KB)\nAttachment ID: ${d.id}\n\nUse this ID with slock message send --attachment-id ${d.id} to include it in a message.\n`);
    });
}
