import assert from "node:assert/strict";
import test from "node:test";
import {
  applyMessageAttachmentLimits,
  formatMessageAttachmentLimitError,
  MAX_MESSAGE_ATTACHMENT_SIZE_BYTES,
  MAX_MESSAGE_ATTACHMENTS,
} from "../src/utils/messageAttachmentLimits";

function file(size: number) {
  return { size };
}

test("accepts files until the message attachment cap", () => {
  const files = Array.from({ length: MAX_MESSAGE_ATTACHMENTS + 2 }, () => file(1024));
  const result = applyMessageAttachmentLimits(0, files);

  assert.equal(result.accepted.length, MAX_MESSAGE_ATTACHMENTS);
  assert.equal(result.rejectedForCount.length, 2);
  assert.equal(result.rejectedForEmpty.length, 0);
  assert.equal(result.rejectedForSize.length, 0);
});

test("honors existing pending attachments before accepting new files", () => {
  const result = applyMessageAttachmentLimits(4, [file(1024), file(1024), file(1024)]);

  assert.equal(result.accepted.length, 1);
  assert.equal(result.rejectedForCount.length, 2);
});

test("rejects empty and oversized files without consuming attachment slots", () => {
  const result = applyMessageAttachmentLimits(4, [
    file(0),
    file(MAX_MESSAGE_ATTACHMENT_SIZE_BYTES + 1),
    file(1024),
  ]);

  assert.equal(result.accepted.length, 1);
  assert.equal(result.rejectedForEmpty.length, 1);
  assert.equal(result.rejectedForSize.length, 1);
  assert.equal(result.rejectedForCount.length, 0);
});

test("formats all skipped-file reasons together", () => {
  const error = formatMessageAttachmentLimitError({
    rejectedForCount: [file(1024), file(1024)],
    rejectedForEmpty: [file(0)],
    rejectedForSize: [file(51 * 1024 * 1024)],
  });

  assert.equal(
    error,
    "Only 5 attachments per message. 2 extra files skipped. 1 empty file skipped. Max 50MB per file. Current largest file is 51.0MB.",
  );
});
