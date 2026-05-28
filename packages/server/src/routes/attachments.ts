import { Router, type NextFunction, type Request, type Response, type Router as RouterType } from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { randomUUID, createHash } from "node:crypto";
import sharp, { type Sharp } from "sharp";
import { eq, inArray, and, isNull, isNotNull, like } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { attachments } from "../db/schema.js";
import * as channelService from "../services/channelService.js";
import { buildAttachmentPreviewResponse, getAttachmentPreviewProvider } from "../services/attachmentPreviews/registry.js";
import { getStorage, getCdnStorage, isStorageTimeoutError } from "../services/storageService.js";

const THUMBNAIL_MAX_WIDTH = 320;
const THUMBNAIL_QUALITY = 75;
const SVG_RASTER_PREVIEW_MAX_WIDTH = 2048;
const SVG_RASTER_PREVIEW_QUALITY = 85;
const SVG_RASTER_DENSITY = 192;
const SVG_RASTER_MAX_PIXELS = 4096 * 4096;
const HTML_PREVIEW_TOKEN_TTL_SECONDS = 300;

interface HtmlPreviewTokenClaims {
  sub: string;
  type: "attachment-html-preview";
  attachmentId: string;
  serverId: string;
  actorType: "user" | "machine";
  actorId: string;
}

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is required");
  return secret;
}

/** Build a CDN URL for a thumbnail key, or null if CDN not configured */
export function getThumbnailUrl(thumbnailKey: string | null): string | null {
  if (!thumbnailKey) return null;
  const cdnBase = process.env.CDN_BASE_URL;
  if (!cdnBase) return null;
  return `${cdnBase.replace(/\/$/, "")}/${thumbnailKey}`;
}

function createImageSharp(buffer: Buffer, mimeType?: string | null): Sharp {
  return isSvgAttachmentMimeType(mimeType)
    ? sharp(buffer, { density: SVG_RASTER_DENSITY, limitInputPixels: SVG_RASTER_MAX_PIXELS })
    : sharp(buffer).rotate();
}

/** Generate a WebP thumbnail from an image buffer. SVG input is rasterized first. */
export async function generateThumbnail(buffer: Buffer, mimeType?: string | null): Promise<Buffer> {
  return createImageSharp(buffer, mimeType)
    .resize(THUMBNAIL_MAX_WIDTH, undefined, { withoutEnlargement: true })
    .webp({ quality: THUMBNAIL_QUALITY })
    .toBuffer();
}

/** Generate the larger safe bitmap used by the image lightbox for SVG attachments. */
export async function generateSvgRasterPreview(buffer: Buffer): Promise<Buffer> {
  return createImageSharp(buffer, "image/svg+xml")
    .resize(SVG_RASTER_PREVIEW_MAX_WIDTH, SVG_RASTER_PREVIEW_MAX_WIDTH, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: SVG_RASTER_PREVIEW_QUALITY })
    .toBuffer();
}

export const attachmentRouter: RouterType = Router();

// Public router — serves files by UUID (no auth required, UUIDs are unguessable)
export const attachmentPublicRouter: RouterType = Router();

// Image MIME types that get thumbnail generation + inline preview behavior
const PREVIEWABLE_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);
const SVG_IMAGE_MIME_TYPE = "image/svg+xml";

const FILENAME_MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": SVG_IMAGE_MIME_TYPE,
  ".html": "text/html",
  ".htm": "text/html",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".json": "application/json",
  ".csv": "text/csv",
};
const MIME_TYPE_RE = /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i;

export const MAX_ATTACHMENT_FILE_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_ATTACHMENT_FILE_SIZE_LABEL = "50MB";
export const ATTACHMENT_UPLOAD_DISABLED_MESSAGE = "File uploads are disabled on this server";
export const ATTACHMENT_TOO_LARGE_MESSAGE = `Max ${MAX_ATTACHMENT_FILE_SIZE_LABEL} per file`;
const MULTER_ATTACHMENT_FILE_SIZE_LIMIT_BYTES = MAX_ATTACHMENT_FILE_SIZE_BYTES + 1024 * 1024;

export function isAttachmentUploadEnabled(): boolean {
  return process.env.ATTACHMENT_UPLOAD_ENABLED !== "false";
}

// Multer uses memory storage — files are buffered then written to storage backend
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MULTER_ATTACHMENT_FILE_SIZE_LIMIT_BYTES },
});

function runAttachmentUpload(req: Request, res: Response, next: NextFunction): void {
  if (!isAttachmentUploadEnabled()) {
    res.status(503).json({
      error: ATTACHMENT_UPLOAD_DISABLED_MESSAGE,
      errorCode: "ATTACHMENT_UPLOAD_DISABLED",
    });
    return;
  }

  upload.array("files", 5)(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        error: ATTACHMENT_TOO_LARGE_MESSAGE,
        errorCode: "ATTACHMENT_TOO_LARGE",
        maxBytes: MAX_ATTACHMENT_FILE_SIZE_BYTES,
      });
      return;
    }
    if (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
      return;
    }
    next();
  });
}

export function isEmptyUploadedFile(file: Pick<Express.Multer.File, "size" | "buffer">): boolean {
  return file.size <= 0 || file.buffer.length <= 0;
}

export function isOversizedUploadedFile(file: Pick<Express.Multer.File, "size">): boolean {
  return file.size > MAX_ATTACHMENT_FILE_SIZE_BYTES;
}

function isPreviewableImageMimeType(mimeType: string | null | undefined): boolean {
  return !!mimeType && PREVIEWABLE_IMAGE_MIME_TYPES.has(mimeType);
}

export function isSvgAttachmentMimeType(mimeType: string | null | undefined): boolean {
  return mimeType?.split(";")[0]?.trim().toLowerCase() === SVG_IMAGE_MIME_TYPE;
}

export function canGenerateImagePreview(mimeType: string | null | undefined): boolean {
  return isPreviewableImageMimeType(mimeType) || isSvgAttachmentMimeType(mimeType);
}

export function buildSvgRasterPreviewKey(thumbnailKey: string): string {
  return thumbnailKey.replace(/^thumbs\//, "previews/");
}

function getSvgRasterPreviewUrl(thumbnailKey: string | null, mimeType: string | null | undefined): string | null {
  if (!thumbnailKey || !isSvgAttachmentMimeType(mimeType)) return null;
  const cdnBase = process.env.CDN_BASE_URL;
  if (!cdnBase) return null;
  return `${cdnBase.replace(/\/$/, "")}/${buildSvgRasterPreviewKey(thumbnailKey)}`;
}

export function isHtmlAttachmentMimeType(mimeType: string | null | undefined): boolean {
  return mimeType?.split(";")[0]?.trim().toLowerCase() === "text/html";
}

export function isPdfAttachmentMimeType(mimeType: string | null | undefined): boolean {
  return mimeType?.split(";")[0]?.trim().toLowerCase() === "application/pdf";
}

export function isMp4AttachmentMimeType(mimeType: string | null | undefined): boolean {
  return mimeType?.split(";")[0]?.trim().toLowerCase() === "video/mp4";
}

function inferMimeTypeFromFilename(filename: string): string | null {
  const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")).toLowerCase() : "";
  return FILENAME_MIME_MAP[ext] || null;
}

export function resolveAttachmentMimeType(
  filename: string,
  mimeType: string | null | undefined,
): string {
  const normalized = mimeType?.trim().toLowerCase();
  if (normalized && normalized !== "application/octet-stream") {
    return normalized;
  }
  return inferMimeTypeFromFilename(normalizeAttachmentFilename(filename))
    || normalized
    || "application/octet-stream";
}

function inferMimeTypeFromBuffer(buffer: Buffer): string | null {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
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

export function normalizeUploadedMimeType(
  filename: string,
  mimeType: string | null | undefined,
  buffer?: Buffer,
  explicitMimeType?: string | null,
): string {
  const explicit = explicitMimeType?.trim().toLowerCase();
  if (explicit && MIME_TYPE_RE.test(explicit)) {
    return explicit;
  }
  const normalized = mimeType?.trim().toLowerCase();
  return inferMimeTypeFromBuffer(buffer ?? Buffer.alloc(0))
    || (normalized && normalized !== "application/octet-stream" ? normalized : null)
    || inferMimeTypeFromFilename(filename)
    || normalized
    || "application/octet-stream";
}

export function normalizeAttachmentFilename(filename: string): string {
  if (!/[^\x00-\x7F]/.test(filename)) return filename;

  const repaired = Buffer.from(filename, "latin1").toString("utf8");
  if (repaired.includes("\uFFFD")) return filename;
  if (Buffer.from(repaired, "utf8").toString("latin1") !== filename) return filename;
  return repaired;
}

function withUtf8CharsetIfNeeded(mimeType: string): string {
  if (/\bcharset=/i.test(mimeType)) return mimeType;
  const lower = mimeType.toLowerCase();
  if (
    lower.startsWith("text/") ||
    lower === "application/json" ||
    lower === "application/ld+json" ||
    lower === "application/xml" ||
    lower.endsWith("+json") ||
    lower.endsWith("+xml")
  ) {
    return `${mimeType}; charset=utf-8`;
  }
  return mimeType;
}

function sanitizeAsciiFallbackFilename(filename: string): string {
  const safe = filename
    .replace(/[\r\n]/g, " ")
    .replace(/["\\]/g, "_")
    .replace(/[^\x20-\x7E]/g, "_")
    .trim();
  return safe || "download";
}

function buildContentDisposition(disposition: "attachment" | "inline", filename: string): string {
  const normalizedFilename = normalizeAttachmentFilename(filename);
  const fallbackFilename = sanitizeAsciiFallbackFilename(normalizedFilename);
  const encodedUtf8Filename = encodeURIComponent(normalizedFilename).replace(
    /['()*]/g,
    (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`
  );
  return `${disposition}; filename="${fallbackFilename}"; filename*=UTF-8''${encodedUtf8Filename}`;
}

export function buildAttachmentContentDisposition(
  filename: string,
  mimeType: string | null | undefined
): string {
  const disposition = isPreviewableImageMimeType(resolveAttachmentMimeType(filename, mimeType)) ? "inline" : "attachment";
  return buildContentDisposition(disposition, filename);
}

export function buildAttachmentDownloadContentDisposition(filename: string): string {
  return buildContentDisposition("attachment", filename);
}

export function buildAttachmentInlinePreviewContentDisposition(
  filename: string,
  mimeType: string | null | undefined
): string {
  const resolvedMimeType = resolveAttachmentMimeType(filename, mimeType);
  const disposition = isPdfAttachmentMimeType(resolvedMimeType) || isMp4AttachmentMimeType(resolvedMimeType) || isPreviewableImageMimeType(resolvedMimeType)
    ? "inline"
    : "attachment";
  return buildContentDisposition(disposition, filename);
}

function shouldUseInlinePreviewDisposition(req: Request, filename: string, mimeType: string | null | undefined): boolean {
  const resolvedMimeType = resolveAttachmentMimeType(filename, mimeType);
  return req.query.disposition === "inline" && (isPdfAttachmentMimeType(resolvedMimeType) || isMp4AttachmentMimeType(resolvedMimeType));
}

function shouldUseDownloadDisposition(req: Request): boolean {
  return req.query.disposition === "attachment" || req.query.download === "1";
}

export function shouldStreamAttachmentThroughServerForRequest(
  req: Pick<Request, "query">,
): boolean {
  return req.query.selectScreenshot === "1";
}

function buildAttachmentContentDispositionForRequest(req: Request, filename: string, mimeType: string | null | undefined): string {
  if (shouldUseDownloadDisposition(req)) {
    return buildAttachmentDownloadContentDisposition(filename);
  }
  return shouldUseInlinePreviewDisposition(req, filename, mimeType)
    ? buildAttachmentInlinePreviewContentDisposition(filename, mimeType)
    : buildAttachmentContentDisposition(filename, mimeType);
}

export function buildAttachmentResponseContentType(mimeType: string | null | undefined): string {
  return withUtf8CharsetIfNeeded(mimeType || "application/octet-stream");
}

export function buildAttachmentContentLengthHeader(sizeBytes: number | null | undefined): string | undefined {
  if (typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes) || sizeBytes < 0) return undefined;
  return String(Math.floor(sizeBytes));
}

export type AttachmentByteRange = { start: number; end: number; size: number } | "unsatisfiable" | null;

export function parseAttachmentByteRange(rangeHeader: string | string[] | undefined, sizeBytes: number | null | undefined): AttachmentByteRange {
  if (!rangeHeader || Array.isArray(rangeHeader)) return null;
  if (typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes) || sizeBytes <= 0) return null;
  const size = Math.floor(sizeBytes);
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match) return null;
  const [, rawStart, rawEnd] = match;
  if (!rawStart && !rawEnd) return null;

  if (!rawStart) {
    const suffixLength = Number(rawEnd);
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return "unsatisfiable";
    const start = Math.max(0, size - suffixLength);
    return { start, end: size - 1, size };
  }

  const start = Number(rawStart);
  const end = rawEnd ? Number(rawEnd) : size - 1;
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) {
    return "unsatisfiable";
  }
  return { start, end: Math.min(end, size - 1), size };
}

function getHtmlPreviewFrameAncestorOrigins(raw = process.env.CORS_ORIGIN): string[] {
  const configuredOrigins = (raw || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowed = new Set<string>();
  for (const origin of configuredOrigins) {
    try {
      const parsed = new URL(origin);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        allowed.add(parsed.origin);
      }
    } catch {
      // Invalid CORS_ORIGIN entries are ignored for CSP frame ancestors.
    }
  }
  return [...allowed];
}

export function buildAttachmentInlinePreviewContentSecurityPolicy(frameAncestorOrigins = getHtmlPreviewFrameAncestorOrigins()): string {
  const frameAncestors = ["'self'", ...frameAncestorOrigins].join(" ");
  return `frame-ancestors ${frameAncestors}`;
}

export function buildHtmlPreviewContentSecurityPolicy(frameAncestorOrigins = getHtmlPreviewFrameAncestorOrigins()): string {
  const frameAncestors = ["'self'", ...frameAncestorOrigins].join(" ");
  return [
    "default-src 'none'",
    // Treat every HTML attachment as hostile, whether it came from a human or
    // an agent. v0 intentionally allows HTTPS subresources for Mermaid/charts;
    // the security contract is that a leaked previewToken only replays this
    // exact HTML preview briefly, not that hostile HTML cannot beacon out.
    "script-src 'unsafe-inline' https:",
    "style-src 'unsafe-inline' https:",
    "img-src data: blob: https:",
    "font-src data: https:",
    "media-src data: blob: https:",
    "connect-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "worker-src 'none'",
    `frame-ancestors ${frameAncestors}`,
  ].join("; ");
}

function buildAttachmentResponse(attachment: {
  id: string;
  filename: string;
  mimeType: string | null;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  thumbnailKey: string | null;
}) {
  const filename = normalizeAttachmentFilename(attachment.filename);
  const resolvedMimeType = resolveAttachmentMimeType(filename, attachment.mimeType);
  return {
    id: attachment.id,
    filename,
    mimeType: resolvedMimeType,
    sizeBytes: attachment.sizeBytes,
    width: attachment.width,
    height: attachment.height,
    thumbnailUrl: getThumbnailUrl(attachment.thumbnailKey),
    rasterPreviewUrl: getSvgRasterPreviewUrl(attachment.thumbnailKey, resolvedMimeType),
  };
}

function logAttachmentAccessError(
  operation: "url" | "serve" | "preview",
  attachmentId: string | undefined,
  err: unknown,
  attachment?: typeof attachments.$inferSelect | null,
): void {
  console.error(`[Attachments] Failed to ${operation} attachment`, {
    attachmentId: attachment?.id ?? attachmentId ?? null,
    channelId: attachment?.channelId ?? null,
    storageKey: attachment?.storageKey ?? null,
    sizeBytes: attachment?.sizeBytes ?? null,
    mimeType: attachment?.mimeType ?? null,
    filename: attachment?.filename ?? null,
    resolvedMimeType: attachment ? resolveAttachmentMimeType(attachment.filename, attachment.mimeType) : null,
  }, err);
}

function verifyAttachmentAccess(
  attachment: typeof attachments.$inferSelect,
  req: Request,
): Promise<boolean> {
  if (req.userId) {
    return channelService.canUserAccessChannel(attachment.channelId, req.userId, req.serverId!);
  }
  if (req.machineId) {
    return channelService.getChannel(attachment.channelId)
      .then((channel) => !!channel && channel.serverId === req.serverId);
  }
  return Promise.resolve(false);
}

function signHtmlPreviewToken(
  attachment: typeof attachments.$inferSelect,
  req: Request,
): { token: string; expiresAt: string } {
  const nowMs = Date.now();
  const actorType = req.userId ? "user" : "machine";
  const actorId = req.userId ?? req.machineId;
  if (!actorId || !req.serverId) {
    throw new Error("Cannot create attachment preview token without scoped actor");
  }

  const token = jwt.sign({
    sub: actorId,
    type: "attachment-html-preview",
    attachmentId: attachment.id,
    serverId: req.serverId,
    actorType,
    actorId,
  } satisfies HtmlPreviewTokenClaims, jwtSecret(), {
    expiresIn: HTML_PREVIEW_TOKEN_TTL_SECONDS,
    audience: "attachment-html-preview",
    issuer: "slock-server",
  });

  return {
    token,
    expiresAt: new Date(nowMs + HTML_PREVIEW_TOKEN_TTL_SECONDS * 1000).toISOString(),
  };
}

function verifyHtmlPreviewToken(
  token: string,
  attachmentId: string,
  serverId: string | undefined,
): HtmlPreviewTokenClaims | null {
  if (!serverId) return null;

  try {
    const claims = jwt.verify(token, jwtSecret(), {
      audience: "attachment-html-preview",
      issuer: "slock-server",
    }) as jwt.JwtPayload & Partial<HtmlPreviewTokenClaims>;

    if (
      claims.type !== "attachment-html-preview" ||
      claims.attachmentId !== attachmentId ||
      claims.serverId !== serverId ||
      (claims.actorType !== "user" && claims.actorType !== "machine") ||
      typeof claims.actorId !== "string" ||
      claims.sub !== claims.actorId
    ) {
      return null;
    }

    return claims as unknown as HtmlPreviewTokenClaims;
  } catch {
    return null;
  }
}

function buildAuthenticatedAttachmentUrl(req: Request, pathSuffix = ""): URL {
  const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`;
  const url = new URL(`${serverUrl}/api/attachments/${req.params.id}${pathSuffix}`);
  const authHeader = req.headers.authorization;
  const queryToken = typeof req.query.token === "string" ? req.query.token : null;
  if (authHeader?.startsWith("Bearer ")) {
    url.searchParams.set("token", authHeader.slice(7));
  } else if (queryToken) {
    url.searchParams.set("token", queryToken);
  }
  if (req.serverId) {
    url.searchParams.set("serverId", req.serverId);
  }
  return url;
}

function buildHtmlPreviewUrl(req: Request, attachment: typeof attachments.$inferSelect): {
  url: URL;
  expiresAt: string;
} {
  const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`;
  const url = new URL(`${serverUrl}/api/attachments/${attachment.id}/html-preview`);
  const { token, expiresAt } = signHtmlPreviewToken(attachment, req);
  url.searchParams.set("previewToken", token);
  if (req.serverId) {
    url.searchParams.set("serverId", req.serverId);
  }
  return { url, expiresAt };
}

// Upload attachments (up to 5 at once)
attachmentRouter.post(
  "/upload",
  runAttachmentUpload,
  async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: "No files provided" });
        return;
      }
      if (files.some(isEmptyUploadedFile)) {
        res.status(400).json({ error: "Empty files are not allowed" });
        return;
      }
      if (files.some(isOversizedUploadedFile)) {
        res.status(413).json({
          error: ATTACHMENT_TOO_LARGE_MESSAGE,
          errorCode: "ATTACHMENT_TOO_LARGE",
          maxBytes: MAX_ATTACHMENT_FILE_SIZE_BYTES,
        });
        return;
      }

      const channelId = req.body.channelId;
      if (!channelId) {
        res.status(400).json({ error: "channelId is required" });
        return;
      }

      // Verify channel access
      const canAccess = await channelService.canUserAccessChannel(channelId, req.userId!, req.serverId!);
      if (!canAccess) {
        res.status(403).json({ error: "You do not have access to this channel" });
        return;
      }

      // Archive gate: no new attachments on an archived channel.
      if (await channelService.isChannelArchived(channelId)) {
        res.status(409).json({ error: "This channel is archived", code: "channel_archived" });
        return;
      }

      const storage = getStorage();
      if (!storage) {
        res.status(503).json({ error: "File uploads are not configured on this server" });
        return;
      }
      const db = getDb();
      const cdnStorage = getCdnStorage();

      // Upload all files to storage; images also get thumbnails. Dedup by content hash.
      const results = await Promise.all(files.map(async (f) => {
        const id = randomUUID();
        const contentHash = createHash("sha256").update(f.buffer).digest("hex");
        const normalizedFilename = normalizeAttachmentFilename(f.originalname);
        const normalizedMimeType = normalizeUploadedMimeType(
          normalizedFilename,
          f.mimetype,
          f.buffer,
        );

        // Check for existing file with the same content hash in this server
        // Scope by storageKey prefix to enforce server-level isolation
        const [existing] = await db
          .select({ storageKey: attachments.storageKey, thumbnailKey: attachments.thumbnailKey })
          .from(attachments)
          .where(and(
            eq(attachments.contentHash, contentHash),
            like(attachments.storageKey, `${req.serverId}/%`),
          ))
          .limit(1);

        let storageKey: string;
        let thumbnailKey: string | null = null;

        if (existing) {
          // Reuse existing storage object — no upload needed
          storageKey = existing.storageKey;
          thumbnailKey = existing.thumbnailKey;
        } else {
          // New content — upload to S3
          const ext = path.extname(normalizedFilename).toLowerCase();
          storageKey = `${req.serverId}/${id}${ext}`;
          await storage.put(storageKey, f.buffer, normalizedMimeType);

          // Generate safe bitmap previews only for supported image attachments.
          if (cdnStorage && canGenerateImagePreview(normalizedMimeType)) {
            try {
              thumbnailKey = `thumbs/${req.serverId}/${id}.webp`;
              const thumbBuf = await generateThumbnail(f.buffer, normalizedMimeType);
              if (isSvgAttachmentMimeType(normalizedMimeType)) {
                const rasterPreviewBuf = await generateSvgRasterPreview(f.buffer);
                await cdnStorage.put(buildSvgRasterPreviewKey(thumbnailKey), rasterPreviewBuf, "image/webp");
              }
              await cdnStorage.put(thumbnailKey, thumbBuf, "image/webp");
            } catch {
              // SVG/raster preview generation failed — continue as a plain file chip.
              thumbnailKey = null;
            }
          }
        }

        return {
          id,
          channelId,
          uploaderId: req.userId!,
          uploaderType: "user" as const,
          filename: normalizedFilename,
          mimeType: normalizedMimeType,
          sizeBytes: f.size,
          storageKey,
          thumbnailKey,
          contentHash,
        };
      }));

      // Insert DB records (uploads already done)
      const inserted = await db
        .insert(attachments)
        .values(results)
        .returning();

      res.json({
        attachments: inserted.map(buildAttachmentResponse),
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      if (isStorageTimeoutError(err)) {
        res.status(504).json({ error: "Attachment storage timed out" });
        return;
      }
      res.status(500).json({ error: "Failed to upload files" });
    }
  }
);

// Return a short-lived presigned URL for an attachment (JSON, no redirect).
// Used by the frontend to download attachments without putting JWTs in query strings.
attachmentPublicRouter.get("/:id/url", async (req, res) => {
  let attachmentForLog: typeof attachments.$inferSelect | null = null;
  try {
    const db = getDb();
    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, req.params.id as string))
      .limit(1);
    attachmentForLog = attachment ?? null;

    if (!attachment) {
      res.status(404).json({ error: "Attachment not found" });
      return;
    }

    // Verify the requester has access to the attachment's channel within the
    // active server. `requireServerForFlex` has already pinned `req.serverId`
    // to the scope the caller claimed; the canUserAccessChannel serverId check
    // refuses cross-server attachment UUIDs.
    if (req.userId) {
      const canAccess = await channelService.canUserAccessChannel(attachment.channelId, req.userId, req.serverId!);
      if (!canAccess) {
        res.status(403).json({ error: "You do not have access to this attachment" });
        return;
      }
    } else if (req.machineId) {
      const channel = await channelService.getChannel(attachment.channelId);
      if (!channel || channel.serverId !== req.serverId) {
        res.status(403).json({ error: "You do not have access to this attachment" });
        return;
      }
    }

    const storage = getStorage();
    if (!storage) {
      res.status(503).json({ error: "File storage is not configured on this server" });
      return;
    }

    if (storage.getPresignedUrl) {
      const expiresIn = 3600;
      const url = await storage.getPresignedUrl(attachment.storageKey, {
        expiresIn,
        responseContentDisposition: buildAttachmentContentDispositionForRequest(req, attachment.filename, attachment.mimeType),
        responseContentType: buildAttachmentResponseContentType(resolveAttachmentMimeType(attachment.filename, attachment.mimeType)),
      });
      res.json({
        url,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      });
      return;
    }

    // Local storage fallback: build absolute URL to the streaming endpoint.
    // `<img src>` / new-tab downloads cannot set headers, so embed both
    // token and serverId as query params. `requireServerForFlex` accepts
    // `serverId` from the query for exactly this path, and `requireFlexAuth`
    // accepts the token from the query — so when the caller ITSELF reached
    // this endpoint via `?token=...&serverId=...` (two-hop fresh-tab flow),
    // propagate the query token rather than dropping it. Spotted by @Cody
    // in PR #945 review.
    const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get("host")}`;
    const url = new URL(`${serverUrl}/api/attachments/${attachment.id}`);
    const authHeader = req.headers.authorization;
    const queryToken = typeof req.query.token === "string" ? req.query.token : null;
    if (authHeader?.startsWith("Bearer ")) {
      url.searchParams.set("token", authHeader.slice(7));
    } else if (queryToken) {
      url.searchParams.set("token", queryToken);
    }
    if (req.serverId) {
      url.searchParams.set("serverId", req.serverId);
    }
    if (shouldUseDownloadDisposition(req)) {
      url.searchParams.set("disposition", "attachment");
    } else if (shouldUseInlinePreviewDisposition(req, attachment.filename, attachment.mimeType)) {
      url.searchParams.set("disposition", "inline");
    }
    res.json({ url: url.toString(), expiresAt: null });
  } catch (err) {
    logAttachmentAccessError("url", req.params.id, err, attachmentForLog);
    res.status(500).json({ error: "Failed to get attachment URL" });
  }
});

attachmentPublicRouter.get("/:id/preview", async (req, res) => {
  let attachmentForLog: typeof attachments.$inferSelect | null = null;
  try {
    const db = getDb();
    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, req.params.id as string))
      .limit(1);
    attachmentForLog = attachment ?? null;

    if (!attachment) {
      res.status(404).json({ error: "Attachment not found" });
      return;
    }

    if (!(await verifyAttachmentAccess(attachment, req))) {
      res.status(403).json({ error: "You do not have access to this attachment" });
      return;
    }

    if (!getAttachmentPreviewProvider(attachment)) {
      res.json({ status: "unsupported" });
      return;
    }

    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    res.json(await buildAttachmentPreviewResponse(attachment));
  } catch (err) {
    logAttachmentAccessError("preview", req.params.id, err, attachmentForLog);
    res.status(500).json({ error: "Failed to build attachment preview" });
  }
});

// Return an authenticated URL for rendering a single-file HTML attachment in
// a sandboxed iframe. Threat model: any server member or agent can upload HTML,
// so the preview assumes hostile input. Scripts are allowed for Mermaid/diagram
// use cases, but the document must not receive Slock origin privileges or affect
// the parent window. The iframe omits allow-same-origin on the client; this
// endpoint keeps ACL checks and preview-only security headers server-side.
attachmentPublicRouter.get("/:id/html-preview-url", async (req, res) => {
  let attachmentForLog: typeof attachments.$inferSelect | null = null;
  try {
    const db = getDb();
    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, req.params.id as string))
      .limit(1);
    attachmentForLog = attachment ?? null;

    if (!attachment) {
      res.status(404).json({ error: "Attachment not found" });
      return;
    }

    if (!(await verifyAttachmentAccess(attachment, req))) {
      res.status(403).json({ error: "You do not have access to this attachment" });
      return;
    }

    if (!isHtmlAttachmentMimeType(resolveAttachmentMimeType(attachment.filename, attachment.mimeType))) {
      res.status(415).json({ error: "Attachment is not previewable HTML" });
      return;
    }

    const { url, expiresAt } = buildHtmlPreviewUrl(req, attachment);
    res.json({ url: url.toString(), expiresAt });
  } catch (err) {
    logAttachmentAccessError("url", req.params.id, err, attachmentForLog);
    res.status(500).json({ error: "Failed to get HTML preview URL" });
  }
});

// Stream HTML through Slock rather than redirecting to object storage so the
// preview path always carries the sandbox-oriented headers below. Normal
// downloads intentionally still use `attachment` disposition.
attachmentPublicRouter.get("/:id/html-preview", async (req, res) => {
  let attachmentForLog: typeof attachments.$inferSelect | null = null;
  try {
    const db = getDb();
    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, req.params.id as string))
      .limit(1);
    attachmentForLog = attachment ?? null;

    if (!attachment) {
      res.status(404).json({ error: "Attachment not found" });
      return;
    }

    const previewToken = typeof req.query.previewToken === "string" ? req.query.previewToken : null;
    const tokenClaims = previewToken
      ? verifyHtmlPreviewToken(previewToken, attachment.id, req.serverId)
      : null;

    if (previewToken && !tokenClaims) {
      res.status(403).json({ error: "Invalid attachment preview token" });
      return;
    }

    if (!previewToken && typeof req.query.token === "string") {
      res.status(403).json({ error: "User bearer query tokens cannot authorize HTML preview" });
      return;
    }

    if (!tokenClaims && !(await verifyAttachmentAccess(attachment, req))) {
      res.status(403).json({ error: "You do not have access to this attachment" });
      return;
    }

    const resolvedMimeType = resolveAttachmentMimeType(attachment.filename, attachment.mimeType);
    if (!isHtmlAttachmentMimeType(resolvedMimeType)) {
      res.status(415).json({ error: "Attachment is not previewable HTML" });
      return;
    }

    const storage = getStorage();
    if (!storage) {
      res.status(503).json({ error: "File storage is not configured on this server" });
      return;
    }

    const stream = await storage.get(attachment.storageKey);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Content-Type", buildAttachmentResponseContentType(resolvedMimeType));
    res.setHeader("Content-Length", attachment.sizeBytes);
    res.setHeader("Content-Security-Policy", buildHtmlPreviewContentSecurityPolicy());
    res.setHeader("Referrer-Policy", "no-referrer");
    // Helmet's default SAMEORIGIN header would block the web app from framing
    // the API-origin preview document. CSP frame-ancestors above is the
    // allowlist source of truth for this sandbox-only endpoint.
    res.removeHeader("X-Frame-Options");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Disposition", buildContentDisposition("inline", attachment.filename));
    stream.pipe(res);
  } catch (err) {
    logAttachmentAccessError("serve", req.params.id, err, attachmentForLog);
    res.status(500).json({ error: "Failed to serve HTML preview" });
  }
});

// Serve an attachment by UUID (requires auth via requireFlexAuth)
attachmentPublicRouter.get("/:id", async (req, res) => {
  let attachmentForLog: typeof attachments.$inferSelect | null = null;
  try {
    const db = getDb();
    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, req.params.id as string))
      .limit(1);
    attachmentForLog = attachment ?? null;

    if (!attachment) {
      res.status(404).json({ error: "Attachment not found" });
      return;
    }

    // Verify the requester has access to the attachment's channel within the
    // active server. `req.serverId` is bound by `requireServerForFlex`.
    if (req.userId) {
      const canAccess = await channelService.canUserAccessChannel(attachment.channelId, req.userId, req.serverId!);
      if (!canAccess) {
        res.status(403).json({ error: "You do not have access to this attachment" });
        return;
      }
    } else if (req.machineId) {
      // Machine auth — verify attachment belongs to the same server
      const channel = await channelService.getChannel(attachment.channelId);
      if (!channel || channel.serverId !== req.serverId) {
        res.status(403).json({ error: "You do not have access to this attachment" });
        return;
      }
    }

    const storage = getStorage();
    if (!storage) {
      res.status(503).json({ error: "File storage is not configured on this server" });
      return;
    }

    // S3: redirect to presigned URL for direct access (no server bandwidth).
    // Download-as-image captures need same-origin readable bytes so the web
    // client can inline protected images as data URLs before rasterizing.
    if (storage.getPresignedUrl && !shouldStreamAttachmentThroughServerForRequest(req)) {
      const presignedUrl = await storage.getPresignedUrl(attachment.storageKey, {
        responseContentDisposition: buildAttachmentContentDispositionForRequest(req, attachment.filename, attachment.mimeType),
        responseContentType: buildAttachmentResponseContentType(resolveAttachmentMimeType(attachment.filename, attachment.mimeType)),
      });
      res.redirect(302, presignedUrl);
      return;
    }

    // Local storage fallback and select-screenshot protected proxy: stream
    // through the app server so auth headers and same-origin CORS stay intact.
    const useInlinePreviewDisposition = shouldUseInlinePreviewDisposition(req, attachment.filename, attachment.mimeType);
    const contentType = buildAttachmentResponseContentType(resolveAttachmentMimeType(attachment.filename, attachment.mimeType));
    const contentDisposition = buildAttachmentContentDispositionForRequest(req, attachment.filename, attachment.mimeType);
    const contentLength = buildAttachmentContentLengthHeader(attachment.sizeBytes);
    const getRange = storage.getRange?.bind(storage);
    const requestedRange = getRange ? parseAttachmentByteRange(req.headers.range, attachment.sizeBytes) : null;
    if (requestedRange === "unsatisfiable") {
      if (contentLength) {
        res.setHeader("Content-Range", `bytes */${contentLength}`);
      }
      res.status(416).end();
      return;
    }
    const stream = requestedRange
      ? await getRange!(attachment.storageKey, requestedRange.start, requestedRange.end)
      : await storage.get(attachment.storageKey);
    res.setHeader("Cache-Control", "private, immutable, max-age=31536000");
    res.setHeader("Content-Type", contentType);
    if (contentLength) {
      res.setHeader("Accept-Ranges", "bytes");
      if (requestedRange) {
        res.status(206);
        res.setHeader("Content-Range", `bytes ${requestedRange.start}-${requestedRange.end}/${requestedRange.size}`);
        res.setHeader("Content-Length", String(requestedRange.end - requestedRange.start + 1));
      } else {
        res.setHeader("Content-Length", contentLength);
      }
    }
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Disposition", contentDisposition);
    if (useInlinePreviewDisposition) {
      // Helmet's default SAMEORIGIN header blocks local API-origin PDFs from
      // being framed by the web app during development. Inline preview URLs are
      // still ACL/token scoped; downloads continue to use attachment disposition.
      res.removeHeader("X-Frame-Options");
      res.setHeader("Content-Security-Policy", buildAttachmentInlinePreviewContentSecurityPolicy());
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Referrer-Policy", "no-referrer");
    }
    stream.pipe(res);
  } catch (err) {
    logAttachmentAccessError("serve", req.params.id, err, attachmentForLog);
    res.status(500).json({ error: "Failed to serve attachment" });
  }
});

/**
 * Batch-fetch attachments for a list of message IDs.
 * Returns a map: messageId → attachment[]
 */
export async function getAttachmentsForMessages(
  messageIds: string[]
): Promise<Map<string, typeof attachments.$inferSelect[]>> {
  if (messageIds.length === 0) return new Map();
  const db = getDb();
  const rows = await db
    .select()
    .from(attachments)
    .where(inArray(attachments.messageId, messageIds));

  const map = new Map<string, typeof attachments.$inferSelect[]>();
  for (const row of rows) {
    if (!row.messageId) continue;
    const list = map.get(row.messageId) ?? [];
    list.push(row);
    map.set(row.messageId, list);
  }
  return map;
}

/**
 * Link uploaded attachments to a message after it's created.
 * Verifies uploader ownership and returns the linked attachment metadata.
 */
export async function linkAttachmentsToMessage(
  attachmentIds: string[],
  messageId: string,
  uploaderId: string
): Promise<{ id: string; filename: string; mimeType: string; sizeBytes: number; width: number | null; height: number | null; thumbnailUrl: string | null }[]> {
  if (attachmentIds.length === 0) return [];
  const db = getDb();
  // Only link attachments that belong to the uploader and aren't already linked
  const linked = await db
    .update(attachments)
    .set({ messageId })
    .where(
      and(
        inArray(attachments.id, attachmentIds),
        eq(attachments.uploaderId, uploaderId),
        isNull(attachments.messageId),
      )
    )
    .returning({
      id: attachments.id,
      filename: attachments.filename,
      mimeType: attachments.mimeType,
      sizeBytes: attachments.sizeBytes,
      width: attachments.width,
      height: attachments.height,
      thumbnailKey: attachments.thumbnailKey,
    });
  return linked.map(buildAttachmentResponse);
}
