import { basename } from "node:path";
import { existsSync, readFileSync, statSync } from "node:fs";
import type { Command } from "commander";
import type { ProfileView } from "@slock-ai/shared";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { emit, fail } from "../../output.js";
import { formatProfile } from "./_format.js";

const MAX_PROFILE_AVATAR_BYTES = 2 * 1024 * 1024;
const PROFILE_AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);
const FILENAME_MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

interface UpdateOptions {
  avatarFile?: string;
  avatarUrl?: string;
  displayName?: string;
  description?: string;
  json?: boolean;
}

const MAX_PROFILE_DESCRIPTION_LENGTH = 3000;
const MAX_PROFILE_DISPLAY_NAME_LENGTH = 80;

function inferImageMimeType(filename: string, buffer: Buffer): string | null {
  const lowerFilename = filename.toLowerCase();
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
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

  const dot = lowerFilename.lastIndexOf(".");
  return dot >= 0 ? FILENAME_MIME_MAP[lowerFilename.slice(dot)] ?? null : null;
}

function readAvatarFile(avatarFile: string): { filename: string; buffer: Buffer; mimeType: string } {
  if (!existsSync(avatarFile)) {
    fail("PROFILE_FILE_NOT_FOUND", `Avatar file does not exist: ${avatarFile}`);
  }

  const stat = statSync(avatarFile);
  if (!stat.isFile()) {
    fail("PROFILE_FILE_NOT_FOUND", `Avatar file is not a regular file: ${avatarFile}`);
  }
  if (stat.size > MAX_PROFILE_AVATAR_BYTES) {
    fail(
      "PROFILE_AVATAR_TOO_LARGE",
      `Avatar file is ${stat.size} bytes; max size is ${MAX_PROFILE_AVATAR_BYTES} bytes`,
    );
  }

  const buffer = readFileSync(avatarFile);
  const filename = basename(avatarFile);
  const mimeType = inferImageMimeType(filename, buffer);
  if (!mimeType || !PROFILE_AVATAR_MIME_TYPES.has(mimeType)) {
    fail(
      "PROFILE_AVATAR_BAD_FORMAT",
      "Avatar must be a JPEG, PNG, GIF, or WebP image",
    );
  }

  return { filename, buffer, mimeType };
}

function normalizeAvatarUrl(avatarUrl: string): string {
  const trimmed = avatarUrl.trim();
  if (trimmed.length === 0) {
    fail("INVALID_ARG", "--avatar-url must not be empty");
  }
  if (!trimmed.startsWith("pixel:")) {
    fail("INVALID_ARG", "--avatar-url currently supports only pixel avatar URLs; use --avatar-file for image uploads");
  }
  return trimmed;
}

export function registerProfileUpdateCommand(parent: Command): void {
  parent
    .command("update")
    .description("Update your own profile")
    .option("--avatar-file <path>", "Path to a local image file to use as your avatar")
    .option("--avatar-url <value>", "Set a pixel avatar URL such as pixel:random:<seed>")
    .option("--display-name <name>", "Set your display name (non-empty)")
    .option("--description <text>", "Set your profile description (non-empty)")
    .option("--json", "Emit machine-readable JSON")
    .action(async (opts: UpdateOptions) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const hasAvatar = opts.avatarFile !== undefined;
      const hasAvatarUrl = opts.avatarUrl !== undefined;
      const hasDisplayName = opts.displayName !== undefined;
      const hasDescription = opts.description !== undefined;
      if (!hasAvatar && !hasAvatarUrl && !hasDisplayName && !hasDescription) {
        fail("INVALID_ARG", "Provide at least one of --avatar-file, --avatar-url, --display-name, or --description");
      }
      if (hasAvatar && hasAvatarUrl) {
        fail("INVALID_ARG", "Use either --avatar-file or --avatar-url, not both");
      }

      let normalizedAvatarUrl: string | undefined;
      if (hasAvatarUrl) {
        normalizedAvatarUrl = normalizeAvatarUrl(opts.avatarUrl!);
      }
      let trimmedDisplayName: string | undefined;
      if (hasDisplayName) {
        trimmedDisplayName = opts.displayName!.trim();
        if (trimmedDisplayName.length === 0) {
          fail("INVALID_ARG", "--display-name must not be empty");
        }
        if (trimmedDisplayName.length > MAX_PROFILE_DISPLAY_NAME_LENGTH) {
          fail("INVALID_ARG", `--display-name must be at most ${MAX_PROFILE_DISPLAY_NAME_LENGTH} characters`);
        }
      }
      if (hasDescription) {
        if (opts.description!.length === 0) {
          fail("INVALID_ARG", "--description must not be empty");
        }
        if (opts.description!.length > MAX_PROFILE_DESCRIPTION_LENGTH) {
          fail("INVALID_ARG", `--description must be at most ${MAX_PROFILE_DESCRIPTION_LENGTH} characters`);
        }
      }

      const client = new ApiClient(ctx);
      let latestProfile: ProfileView | null = null;

      if (hasAvatarUrl || hasDisplayName || hasDescription) {
        const body: { avatarUrl?: string; displayName?: string; description?: string } = {};
        if (hasAvatarUrl) {
          body.avatarUrl = normalizedAvatarUrl!;
        }
        if (hasDisplayName) {
          body.displayName = trimmedDisplayName!;
        }
        if (hasDescription) {
          body.description = opts.description!;
        }
        const res = await client.request<ProfileView>(
          "POST",
          `/internal/agent/${encodeURIComponent(ctx.agentId)}/profile`,
          body,
        );
        if (!res.ok || !res.data) {
          const code = res.errorCode ?? (res.status >= 500 ? "SERVER_5XX" : "PROFILE_UPDATE_FAILED");
          fail(code, res.error ?? `HTTP ${res.status}`);
        }
        latestProfile = res.data;
      }

      if (hasAvatar) {
        const avatar = readAvatarFile(opts.avatarFile!);
        const form = new FormData();
        const avatarBytes = Uint8Array.from(avatar.buffer);
        form.append("avatar", new Blob([avatarBytes], { type: avatar.mimeType }), avatar.filename);

        const res = await client.requestMultipart<ProfileView>(
          "POST",
          `/internal/agent/${encodeURIComponent(ctx.agentId)}/profile/avatar`,
          form,
        );
        if (!res.ok || !res.data) {
          const code = res.errorCode ?? (res.status >= 500 ? "SERVER_5XX" : "PROFILE_UPDATE_FAILED");
          fail(code, res.error ?? `HTTP ${res.status}`);
        }
        latestProfile = res.data;
      }

      if (!latestProfile) {
        fail("PROFILE_UPDATE_FAILED", "No profile returned from server");
      }

      if (opts.json) {
        emit({ ok: true, data: latestProfile });
        return;
      }

      process.stdout.write(`${formatProfile(latestProfile!)}\n`);
    });
}
