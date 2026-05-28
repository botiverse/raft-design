import assert from "node:assert/strict";
import test from "node:test";
import { attachmentPreviewRenderers, loadAttachmentPreviewRenderer } from "../src/components/message/attachmentPreviews/registry";

test("attachment preview renderers are keyed by preview data kind", async () => {
  assert.deepEqual(Object.keys(attachmentPreviewRenderers), ["diff", "csv", "markdown", "pdf", "text"]);
  assert.equal((await loadAttachmentPreviewRenderer("diff"))?.kind, "diff");
  assert.equal((await loadAttachmentPreviewRenderer("csv"))?.kind, "csv");
  assert.equal((await loadAttachmentPreviewRenderer("markdown"))?.kind, "markdown");
  assert.equal((await loadAttachmentPreviewRenderer("pdf"))?.kind, "pdf");
  assert.equal((await loadAttachmentPreviewRenderer("text"))?.kind, "text");
});
