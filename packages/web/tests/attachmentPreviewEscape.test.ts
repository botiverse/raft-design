import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("attachment preview shell closes on Escape like the image lightbox", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");

  assert.match(source, /function AttachmentPreviewShell/);
  assert.match(source, /const handleKeyDown = \(event: KeyboardEvent\) => \{/);
  assert.match(source, /if \(event\.key !== "Escape"\) return;/);
  assert.match(source, /event\.preventDefault\(\);/);
  assert.match(source, /event\.stopPropagation\(\);/);
  assert.match(source, /onClose\(\);/);
  assert.match(source, /document\.addEventListener\("keydown", handleKeyDown\);/);
  assert.match(source, /document\.removeEventListener\("keydown", handleKeyDown\);/);
  assert.match(source, /<HtmlAttachmentPreviewModal/);
  assert.match(source, /<VideoAttachmentPreviewModal/);
  assert.match(source, /<DocumentAttachmentPreviewModal/);
});
