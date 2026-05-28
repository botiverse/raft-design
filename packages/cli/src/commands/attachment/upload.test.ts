import assert from "node:assert/strict";
import test from "node:test";

import {
  AttachmentUploadArgError,
  MAX_ATTACHMENT_UPLOAD_BYTES,
  inferUploadMimeType,
  normalizeExplicitMimeType,
  validateUploadFileSize,
} from "./upload.js";

test("inferUploadMimeType detects images from magic bytes without an extension", () => {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  assert.equal(inferUploadMimeType("attachment", pngHeader), "image/png");

  const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
  assert.equal(inferUploadMimeType("tmpfile", jpegHeader), "image/jpeg");
});

test("inferUploadMimeType falls back to filename and then octet-stream", () => {
  assert.equal(inferUploadMimeType("design.webp", Buffer.from("not-webp")), "image/webp");
  assert.equal(inferUploadMimeType("attachment", Buffer.from("unknown")), "application/octet-stream");
});

test("inferUploadMimeType lets explicit MIME override detection", () => {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  assert.equal(inferUploadMimeType("attachment", pngHeader, "image/svg+xml"), "image/svg+xml");
});

test("normalizeExplicitMimeType validates type/subtype shape", () => {
  assert.equal(normalizeExplicitMimeType(" IMAGE/PNG "), "image/png");
  assert.throws(
    () => normalizeExplicitMimeType("image"),
    (err) => err instanceof AttachmentUploadArgError && err.code === "INVALID_ARG",
  );
});

test("validateUploadFileSize rejects empty attachments before upload", () => {
  assert.throws(
    () => validateUploadFileSize(0),
    (err) => (
      err instanceof AttachmentUploadArgError
      && err.code === "INVALID_ARG"
      && err.message.includes("0-byte")
    ),
  );
});

test("validateUploadFileSize rejects files over 50MB before upload", () => {
  assert.throws(
    () => validateUploadFileSize(MAX_ATTACHMENT_UPLOAD_BYTES + 1),
    (err) => (
      err instanceof AttachmentUploadArgError
      && err.code === "INVALID_ARG"
      && err.message.includes("max upload size is 50MB")
    ),
  );
});
