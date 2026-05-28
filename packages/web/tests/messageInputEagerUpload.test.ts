import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const source = readFileSync(resolve(repoRoot, "src/components/message/MessageInput.tsx"), "utf8");

function section(start: string, end: string): string {
  const startIndex = source.indexOf(start);
  assert.notEqual(startIndex, -1, `missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex);
  assert.notEqual(endIndex, -1, `missing end marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test("MessageInput uploads attachments as soon as files enter the composer", () => {
  const fileHandling = section("// File handling", "const handleChange");

  assert.match(fileHandling, /const startAttachmentUpload = useCallback/);
  assert.match(fileHandling, /api\.post<AttachmentUploadResponse>\("\/attachments\/upload"/);
  assert.match(fileHandling, /setPendingFiles\(\(prev\) => \[\.\.\.prev, \.\.\.newFiles\]\);[\s\S]*?void startAttachmentUpload\(pending\);/);
});

test("MessageInput send path uses already-uploaded attachment ids", () => {
  const submit = section("const handleSubmit = async", "const handleKeyDown");

  assert.match(submit, /const attachmentIds = filesToSend\.map\(\(pf\) => pf\.attachmentId\);/);
  assert.match(submit, /sendMessage\(channelId, messageContent, attachmentIds\.filter/);
  assert.doesNotMatch(submit, /\/attachments\/upload/);
  assert.doesNotMatch(submit, /new FormData\(/);
});

test("MessageInput exposes failed upload retry state on attachment chips", () => {
  assert.match(source, /uploadStatus === "error"/);
  assert.match(source, /Tap to retry/);
  assert.match(source, /onRetry\(\);/);
  assert.match(source, /Remove or retry failed attachments before sending\./);
});

test("MessageInput returns uploaded attachments to the normal chip state", () => {
  assert.match(source, /uploadStatus: "ready"/);
  assert.doesNotMatch(source, />\s*Ready\s*</);
});
