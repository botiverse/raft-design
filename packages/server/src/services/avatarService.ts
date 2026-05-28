import { createHash } from "node:crypto";
import sharp from "sharp";

import { getCdnStorage, getStorage } from "./storageService.js";
import type { StorageBackend } from "./storageService.js";
import type { Express } from "express";
import type { Request } from "express";
import multer from "multer";
import { getThumbnailUrl } from "../routes/attachments.js";

export const MAX_PROFILE_AVATAR_BYTES = 2 * 1024 * 1024;
export const PROFILE_AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export const PROFILE_AVATAR_BAD_FORMAT_MESSAGE = "Only image files are allowed (JPEG, PNG, GIF, WebP)";
export const PROFILE_AVATAR_TOO_LARGE_MESSAGE = `Avatar must be ${MAX_PROFILE_AVATAR_BYTES} bytes or smaller`;

export function createAvatarUpload(): multer.Multer {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_PROFILE_AVATAR_BYTES },
    fileFilter: (_req, file, cb) => {
      if (!PROFILE_AVATAR_MIME_TYPES.has(file.mimetype)) {
        cb(new Error(PROFILE_AVATAR_BAD_FORMAT_MESSAGE));
        return;
      }
      cb(null, true);
    },
  });
}

export async function runSingleAvatarUpload(
  upload: multer.Multer,
  req: Request,
): Promise<Express.Multer.File | null> {
  return new Promise((resolve, reject) => {
    upload.single("avatar")(req, {} as never, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(req.file ?? null);
    });
  });
}

function getAvatarStorage(): StorageBackend | null {
  return getCdnStorage() || getStorage();
}

export async function storeProfileAvatar(
  namespace: string,
  existingAvatarUrl: string | null,
  fileBuffer: Buffer,
): Promise<string> {
  const storage = getAvatarStorage();
  if (!storage) {
    throw new Error("Storage not configured");
  }

  const processed = await sharp(fileBuffer)
    .resize(256, 256, { fit: "cover" })
    .webp({ quality: 85 })
    .toBuffer();

  const contentHash = createHash("sha256").update(processed).digest("hex").slice(0, 32);
  const storageKey = `avatars/${namespace}/${contentHash}.webp`;
  const avatarUrl = getThumbnailUrl(storageKey) ?? `/api/avatars/${namespace}/${contentHash}.webp`;

  if (existingAvatarUrl !== avatarUrl) {
    await storage.put(storageKey, processed, "image/webp");
  }

  return avatarUrl;
}

export async function storeAgentAvatar(
  serverId: string,
  existingAvatarUrl: string | null,
  fileBuffer: Buffer,
): Promise<string> {
  return storeProfileAvatar(serverId, existingAvatarUrl, fileBuffer);
}

export async function storeUserAvatar(
  existingAvatarUrl: string | null,
  fileBuffer: Buffer,
): Promise<string> {
  return storeProfileAvatar("users", existingAvatarUrl, fileBuffer);
}
