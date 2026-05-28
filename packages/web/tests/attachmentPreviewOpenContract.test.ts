import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("document previews do not fetch signed URLs for markdown csv or text before opening", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");

  assert.match(source, /const documentPreviewRequestRef = useRef<Map<string, Promise<void>>>\(new Map\(\)\);/);
  assert.match(source, /if \(documentPreviewRequestRef\.current\.has\(attachment\.id\)\) \{\s*return;\s*\}/);
  assert.match(
    source,
    /const url = previewResponse\.data\.kind === "pdf"\s*\? \(await api\.get\(`\/attachments\/\$\{attachment\.id\}\/url\?disposition=inline`\)\)\.data\.url\s*: null;/,
  );
  assert.doesNotMatch(source, /const inlinePdfQuery = previewResponse\.data\.kind === "pdf"/);
  assert.doesNotMatch(source, /api\.get\(`\/attachments\/\$\{attachment\.id\}\/url\$\{inlinePdfQuery\}`\)/);
});

test("document attachment cards show preview affordance and visible loading feedback", () => {
  const messageSource = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");
  const chipSource = readFileSync(resolve(repoRoot, "src/components/message/AttachmentChip.tsx"), "utf8");
  const shellSource = readFileSync(resolve(repoRoot, "src/components/ui/PreviewShell.tsx"), "utf8");

  assert.match(
    messageSource,
    /variant="compact"[\s\S]{0,200}?loading=\{isHtmlLoading\}[\s\S]{0,200}?affordance="preview"[\s\S]{0,120}?affordanceName="document-preview"/,
  );
  assert.match(chipSource, /loadingLabel = "Opening preview…"/);
  assert.match(chipSource, /data-message-affordance="attachment-preview-loading"/);
  // Loading state overrides PreviewShell's bg-white via Tailwind important.
  // No opacity modifier — that combined with the OKlab color-mix shell bg
  // paints cyan on Chromium (stdrc 2026-05-23 #proj-theme:441c8b2b
  // cfd10230). The loading bar + spinner are the dominant busy signal.
  assert.match(chipSource, /"!bg-brutal-yellow\/30 cursor-wait"/);
  // Normal-state hover lives on PreviewShell's shared skin. No active token
  // — press inherits hover, matching pre-refactor QuotedMessageCard.
  assert.match(shellSource, /hover:bg-black\/5`/);
  assert.doesNotMatch(shellSource, /active:bg-brutal-yellow/);
  assert.doesNotMatch(shellSource, /active:opacity-90/);
  assert.match(chipSource, /const disabled = isOptimistic \|\| loading \|\| !onClick;/);
  // PreviewShell renders <div> instead of <button> when onClick is undefined,
  // so disabled state is expressed by not passing onClick rather than a
  // disabled attr. Verify the gating still flows from `disabled`.
  assert.match(chipSource, /onClick=\{disabled \? undefined : onClick\}/);
});

test("mp4 attachments reuse the attachment preview shell instead of downloading directly", () => {
  const messageSource = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");
  const attachmentSource = readFileSync(resolve(repoRoot, "src/components/message/attachmentPreview.ts"), "utf8");

  assert.match(attachmentSource, /export function isMp4Attachment/);
  assert.match(messageSource, /function VideoAttachmentPreviewModal/);
  assert.match(messageSource, /<AttachmentPreviewShell filename=\{filename\} label="MP4 preview"/);
  assert.match(messageSource, /<video[\s\S]{0,240}?controls[\s\S]{0,240}?playsInline[\s\S]{0,240}?preload="metadata"/);
  assert.match(messageSource, /api\.get\(`\/attachments\/\$\{attachment\.id\}\/url\?disposition=inline`\)/);
  assert.match(messageSource, /affordanceName=\{isHtml \? "html-preview" : isImage \? "image-preview" : isVideo \? "video-preview" : "file-download"\}/);
});

test("attachment previews intercept close-tab shortcut before the browser closes the tab", () => {
  const lightboxSource = readFileSync(resolve(repoRoot, "src/components/ui/Lightbox.tsx"), "utf8");

  assert.match(lightboxSource, /const closeShortcut =\s*e\.key\.toLowerCase\(\) === "w" &&\s*\(e\.metaKey \|\| e\.ctrlKey\) &&\s*!e\.shiftKey &&\s*!e\.altKey;/);
  assert.match(lightboxSource, /if \(e\.key !== "Escape" && !closeShortcut\) return;/);
  assert.match(lightboxSource, /e\.preventDefault\(\);\s*e\.stopPropagation\(\);\s*onClose\(\);/);
  assert.match(lightboxSource, /document\.addEventListener\("keydown", handler\);/);
  assert.match(lightboxSource, /return \(\) => document\.removeEventListener\("keydown", handler\);/);
});

test("html attachment chip uses user-facing HTML preview copy", () => {
  const messageSource = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");

  assert.match(messageSource, /isHtml \? "HTML preview" : isVideo \? "MP4 video preview"/);
  assert.doesNotMatch(messageSource, /"Sandboxed HTML preview"/);
});
