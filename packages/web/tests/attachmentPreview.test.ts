import assert from "node:assert/strict";
import test from "node:test";
import { CSV_PREVIEW_MAX_FILE_SIZE_BYTES } from "@slock-ai/shared";
import { documentPreviewLabel, formatDiffPatchStats, isCsvAttachment, isDiffPatchAttachment, isDocumentPreviewAttachment, isMarkdownAttachment, isMp4Attachment, isPdfAttachment, isTextAttachment } from "../src/components/message/attachmentPreview";

test("isDiffPatchAttachment classifies patch previews by filename and MIME", () => {
  assert.equal(isDiffPatchAttachment({ filename: "changes.diff", mimeType: "text/plain" }), true);
  assert.equal(isDiffPatchAttachment({ filename: "changes", mimeType: "text/x-patch" }), true);
  assert.equal(isDiffPatchAttachment({ filename: "screenshot.png", mimeType: "image/png" }), false);
});

test("formatDiffPatchStats keeps tiny preview copy compact", () => {
  assert.equal(
    formatDiffPatchStats({ kind: "diff", stats: { files: 2, hunks: 5, additions: 41, deletions: 9 } }),
    "2 files · 5 hunks · +41 -9",
  );
  assert.equal(
    formatDiffPatchStats({ kind: "diff", stats: { files: 1, hunks: 1, additions: 1, deletions: 0 } }),
    "1 file · 1 hunk · +1 -0",
  );
});


test("document attachment classifiers cover csv markdown pdf and text", () => {
  assert.equal(isCsvAttachment({ filename: "data.csv", mimeType: "text/plain", sizeBytes: CSV_PREVIEW_MAX_FILE_SIZE_BYTES }), true);
  assert.equal(isCsvAttachment({ filename: "data.csv", mimeType: "text/plain", sizeBytes: CSV_PREVIEW_MAX_FILE_SIZE_BYTES + 1 }), false);
  assert.equal(isMarkdownAttachment({ filename: "README.md", mimeType: "text/plain" }), true);
  assert.equal(isPdfAttachment({ filename: "paper", mimeType: "application/pdf" }), true);
  assert.equal(isTextAttachment({ filename: "notes.txt", mimeType: "application/octet-stream" }), true);
  assert.equal(isTextAttachment({ filename: "notes", mimeType: "text/plain; charset=utf-8" }), true);
  assert.equal(isDocumentPreviewAttachment({ filename: "paper.pdf", mimeType: "application/octet-stream", sizeBytes: 1024 }), true);
  assert.equal(isDocumentPreviewAttachment({ filename: "notes.txt", mimeType: "application/octet-stream", sizeBytes: 1024 }), true);
  assert.equal(isDocumentPreviewAttachment({ filename: "image.png", mimeType: "image/png", sizeBytes: 1024 }), false);
});

test("isMp4Attachment classifies MP4 previews by filename and MIME", () => {
  assert.equal(isMp4Attachment({ filename: "demo.mp4", mimeType: "application/octet-stream" }), true);
  assert.equal(isMp4Attachment({ filename: "demo", mimeType: "video/mp4" }), true);
  assert.equal(isMp4Attachment({ filename: "demo.mov", mimeType: "video/quicktime" }), false);
});

test("documentPreviewLabel names each renderer", () => {
  assert.equal(documentPreviewLabel("csv"), "CSV preview");
  assert.equal(documentPreviewLabel("markdown"), "Markdown preview");
  assert.equal(documentPreviewLabel("pdf"), "PDF preview");
  assert.equal(documentPreviewLabel("text"), "Text preview");
});
