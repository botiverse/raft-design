import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import {
  buildAttachmentContentLengthHeader,
  buildAttachmentContentDisposition,
  buildAttachmentDownloadContentDisposition,
  buildAttachmentInlinePreviewContentDisposition,
  buildAttachmentInlinePreviewContentSecurityPolicy,
  buildAttachmentResponseContentType,
  buildHtmlPreviewContentSecurityPolicy,
  generateSvgRasterPreview,
  generateThumbnail,
  isEmptyUploadedFile,
  normalizeAttachmentFilename,
  normalizeUploadedMimeType,
  parseAttachmentByteRange,
  resolveAttachmentMimeType,
} from "./attachments.js";

test("normalizeAttachmentFilename repairs mojibake UTF-8 filenames", () => {
  const original = "这文件里有什么.pdf";
  const mojibake = Buffer.from(original, "utf8").toString("latin1");

  assert.equal(normalizeAttachmentFilename(mojibake), original);
});

test("normalizeAttachmentFilename leaves normal filenames unchanged", () => {
  assert.equal(normalizeAttachmentFilename("report-final.pdf"), "report-final.pdf");
  assert.equal(normalizeAttachmentFilename("café.pdf"), "café.pdf");
});

test("buildAttachmentContentDisposition encodes unicode filenames with RFC5987", () => {
  const disposition = buildAttachmentContentDisposition("这文件里有什么.pdf", "application/pdf");

  assert.match(disposition, /^attachment; filename="/);
  assert.match(disposition, /filename\*=UTF-8''/);
  assert.match(disposition, /%E8%BF%99%E6%96%87%E4%BB%B6%E9%87%8C%E6%9C%89%E4%BB%80%E4%B9%88\.pdf/);
});


test("inline preview disposition is limited to PDF, MP4, and images", () => {
  assert.match(buildAttachmentInlinePreviewContentDisposition("paper.pdf", "application/pdf"), /^inline; filename="/);
  assert.match(buildAttachmentInlinePreviewContentDisposition("demo.mp4", "video/mp4"), /^inline; filename="/);
  assert.match(buildAttachmentInlinePreviewContentDisposition("diagram.html", "text/html"), /^attachment; filename="/);
  assert.match(buildAttachmentInlinePreviewContentDisposition("data.csv", "text/csv"), /^attachment; filename="/);
  assert.match(buildAttachmentInlinePreviewContentDisposition("diagram.svg", "image/svg+xml"), /^attachment; filename="/);
});

test("resolveAttachmentMimeType recovers MP4 from filename", () => {
  assert.equal(resolveAttachmentMimeType("demo.MP4", "application/octet-stream"), "video/mp4");
});

test("inline attachment preview CSP only allows configured frame ancestors", () => {
  assert.equal(
    buildAttachmentInlinePreviewContentSecurityPolicy(["https://app.slock.ai"]),
    "frame-ancestors 'self' https://app.slock.ai",
  );
});

test("buildAttachmentResponseContentType appends utf-8 for text-like types", () => {
  assert.equal(buildAttachmentResponseContentType("text/markdown"), "text/markdown; charset=utf-8");
  assert.equal(buildAttachmentResponseContentType("text/html"), "text/html; charset=utf-8");
  assert.equal(buildAttachmentResponseContentType("application/json"), "application/json; charset=utf-8");
  assert.equal(buildAttachmentResponseContentType("application/pdf"), "application/pdf");
});

test("buildAttachmentContentLengthHeader only returns finite non-negative integers", () => {
  assert.equal(buildAttachmentContentLengthHeader(42), "42");
  assert.equal(buildAttachmentContentLengthHeader(42.9), "42");
  assert.equal(buildAttachmentContentLengthHeader(0), "0");
  assert.equal(buildAttachmentContentLengthHeader(-1), undefined);
  assert.equal(buildAttachmentContentLengthHeader(Number.NaN), undefined);
  assert.equal(buildAttachmentContentLengthHeader(undefined), undefined);
  assert.equal(buildAttachmentContentLengthHeader(null), undefined);
});

test("parseAttachmentByteRange supports browser media range requests", () => {
  assert.deepEqual(parseAttachmentByteRange("bytes=0-", 100), { start: 0, end: 99, size: 100 });
  assert.deepEqual(parseAttachmentByteRange("bytes=20-39", 100), { start: 20, end: 39, size: 100 });
  assert.deepEqual(parseAttachmentByteRange("bytes=90-200", 100), { start: 90, end: 99, size: 100 });
  assert.deepEqual(parseAttachmentByteRange("bytes=-10", 100), { start: 90, end: 99, size: 100 });
  assert.equal(parseAttachmentByteRange("bytes=100-120", 100), "unsatisfiable");
  assert.equal(parseAttachmentByteRange("bytes=50-40", 100), "unsatisfiable");
  assert.equal(parseAttachmentByteRange("bytes=0-1,3-4", 100), null);
});

test("resolveAttachmentMimeType recovers legacy HTML rows from filename", () => {
  assert.equal(
    resolveAttachmentMimeType("diagram.HTML", "application/octet-stream"),
    "text/html",
  );
});

test("normal attachment disposition keeps HTML as download-only", () => {
  const disposition = buildAttachmentContentDisposition("diagram.html", "text/html");
  assert.match(disposition, /^attachment; filename="/);
});

test("HTML preview CSP allows external subresources but blocks privileged channels", () => {
  const csp = buildHtmlPreviewContentSecurityPolicy(["https://app.slock.ai"]);
  assert.match(csp, /script-src 'unsafe-inline' https:/);
  assert.match(csp, /style-src 'unsafe-inline' https:/);
  assert.match(csp, /img-src data: blob: https:/);
  assert.match(csp, /font-src data: https:/);
  assert.match(csp, /media-src data: blob: https:/);
  assert.match(csp, /connect-src 'none'/);
  assert.match(csp, /frame-ancestors 'self' https:\/\/app\.slock\.ai/);
  assert.match(csp, /base-uri 'none'/);
  assert.match(csp, /form-action 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /worker-src 'none'/);
  assert.doesNotMatch(csp, /allow-same-origin/);
});

test("normalizeUploadedMimeType keeps explicit image mime types", () => {
  assert.equal(
    normalizeUploadedMimeType("mock.png", "image/png"),
    "image/png",
  );
});

test("isEmptyUploadedFile rejects zero-byte multipart files", () => {
  assert.equal(isEmptyUploadedFile({ size: 0, buffer: Buffer.alloc(0) }), true);
  assert.equal(isEmptyUploadedFile({ size: 1, buffer: Buffer.from([0]) }), false);
});

test("normalizeUploadedMimeType recovers PNG from application/octet-stream by filename", () => {
  assert.equal(
    normalizeUploadedMimeType("mock.PNG", "application/octet-stream"),
    "image/png",
  );
});

test("normalizeUploadedMimeType recovers SVG from application/octet-stream by filename", () => {
  assert.equal(
    normalizeUploadedMimeType("diagram.svg", "application/octet-stream"),
    "image/svg+xml",
  );
});

test("normalizeUploadedMimeType recovers PNG from file signature when mime type is missing", () => {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  assert.equal(
    normalizeUploadedMimeType("attachment", undefined, pngHeader),
    "image/png",
  );
});

test("normalizeUploadedMimeType prefers file signature over non-explicit transport mime", () => {
  const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
  assert.equal(
    normalizeUploadedMimeType("attachment", "application/octet-stream", jpegHeader),
    "image/jpeg",
  );
  assert.equal(
    normalizeUploadedMimeType("attachment.png", "text/plain", jpegHeader),
    "image/jpeg",
  );
});

test("normalizeUploadedMimeType lets explicit override win", () => {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  assert.equal(
    normalizeUploadedMimeType("attachment", "application/octet-stream", pngHeader, "image/svg+xml"),
    "image/svg+xml",
  );
});

test("normalizeUploadedMimeType ignores malformed explicit MIME overrides", () => {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  assert.equal(
    normalizeUploadedMimeType("attachment", "application/octet-stream", pngHeader, "not-a-mime-type"),
    "image/png",
  );
});

test("resolveAttachmentMimeType recovers legacy image rows from filename", () => {
  assert.equal(
    resolveAttachmentMimeType("screenshot.webp", "application/octet-stream"),
    "image/webp",
  );
});

test("buildAttachmentContentDisposition treats legacy octet-stream image filenames as inline", () => {
  const disposition = buildAttachmentContentDisposition("screenshot.png", "application/octet-stream");
  assert.match(disposition, /^inline; filename="/);
});

test("buildAttachmentDownloadContentDisposition forces image filenames to attachment", () => {
  const disposition = buildAttachmentDownloadContentDisposition("reaction.gif");
  assert.match(disposition, /^attachment; filename="reaction\.gif"/);
});

test("image thumbnails honor EXIF orientation", async () => {
  const orientedJpeg = await sharp({
    create: {
      width: 40,
      height: 20,
      channels: 3,
      background: { r: 255, g: 0, b: 0 },
    },
  })
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toBuffer();

  const thumbnail = await generateThumbnail(orientedJpeg, "image/jpeg");
  const metadata = await sharp(thumbnail).metadata();

  assert.equal(metadata.width, 20);
  assert.equal(metadata.height, 40);
});

test("buildAttachmentContentDisposition keeps raw SVG download-only", () => {
  const disposition = buildAttachmentContentDisposition("diagram.svg", "image/svg+xml");
  assert.match(disposition, /^attachment; filename="/);
});

test("SVG raster previews are converted to WebP bitmaps", async () => {
  const svg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="32" viewBox="0 0 64 32">
      <rect width="64" height="32" fill="gold"/>
      <circle cx="32" cy="16" r="12" fill="black"/>
    </svg>
  `);
  const thumb = await generateThumbnail(svg, "image/svg+xml");
  const preview = await generateSvgRasterPreview(svg);

  for (const buffer of [thumb, preview]) {
    assert.equal(buffer.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(buffer.subarray(8, 12).toString("ascii"), "WEBP");
  }
});

test("invalid SVG raster previews fail closed", async () => {
  await assert.rejects(
    () => generateSvgRasterPreview(Buffer.from("<svg><broken></svg>")),
    /Input buffer has corrupt header|corrupt|svg/i,
  );
});
