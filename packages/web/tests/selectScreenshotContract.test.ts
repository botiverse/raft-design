import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("download-as-image uses protected attachment bytes for message images", () => {
  const messageItem = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");
  const screenshot = readFileSync(resolve(repoRoot, "src/utils/selectScreenshot.ts"), "utf8");

  assert.match(messageItem, /data-select-screenshot-attachment-id=\{att\.id\}/);
  assert.match(messageItem, /data-select-screenshot-attachment-width=\{att\.width \?\? undefined\}/);
  assert.match(messageItem, /data-select-screenshot-attachment-height=\{att\.height \?\? undefined\}/);
  assert.match(screenshot, /img\.dataset\.selectScreenshotAttachmentId/);
  assert.match(screenshot, /\/attachments\/\$\{encodeURIComponent\(attachmentId\)\}\?disposition=inline&selectScreenshot=1/);
  assert.match(screenshot, /img\.dataset\.selectScreenshotAttachmentWidth/);
  assert.match(screenshot, /img\.dataset\.selectScreenshotAttachmentHeight/);
  assert.match(screenshot, /headers: getAuthHeaders\(\)/);
  assert.match(screenshot, /const liveHeight = container\.offsetHeight;/);

  const inlineBeforeHeight = screenshot.indexOf("await Promise.all(imgs.map((img) => inlineImageForScreenshot(img)));");
  const heightAfterInline = screenshot.indexOf("const liveHeight = container.offsetHeight;");
  assert.ok(inlineBeforeHeight >= 0, "image inlining must be explicit");
  assert.ok(heightAfterInline > inlineBeforeHeight, "export height must be measured after images are inlined/decoded");
});

test("download-as-image strips reaction picker affordance but preserves reaction chips", () => {
  const messageItem = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");
  const screenshot = readFileSync(resolve(repoRoot, "src/utils/selectScreenshot.ts"), "utf8");

  assert.match(screenshot, /\[data-message-affordance\]/);
  assert.match(messageItem, /data-message-affordance="reaction"/);
  assert.match(messageItem, /data-message-affordance="reaction-picker"/);
  assert.match(messageItem, /visibleReactions\.map\(\(reaction\) => \{/);
  assert.match(messageItem, /aria-label=\{`\$\{reaction\.emoji\} reaction from \$\{reactorSummary\}`\}/);
  assert.doesNotMatch(
    messageItem,
    /visibleReactions\.map\(\(reaction\) => \{[\s\S]{0,900}data-message-affordance=/,
  );
});

test("download-as-image freezes thread reply chip box from the live message", () => {
  const screenshot = readFileSync(resolve(repoRoot, "src/utils/selectScreenshot.ts"), "utf8");

  assert.match(screenshot, /FREEZE_RENDERED_BOX_SELECTORS/);
  assert.match(screenshot, /data-testid="message-thread-replies-badge"/);
  assert.match(screenshot, /function freezeCloneRenderedBoxes/);
  assert.match(screenshot, /sourceEl\.getBoundingClientRect\(\)/);
  assert.match(screenshot, /cloneEl\.style\.width = width/);
  assert.match(screenshot, /cloneEl\.style\.minWidth = width/);
  assert.match(screenshot, /cloneEl\.style\.maxWidth = width/);
  assert.match(screenshot, /freezeCloneRenderedBoxes\(node, clone\)/);
});

test("download-as-image measures container width from the message row, not its parent", () => {
  // Anchor the share-screenshot container width to the live row's own
  // rendered box. Measuring `parentElement` (the chat column) lets the
  // container become wider than where the row actually sits, and html-to-
  // image's <foreignObject> re-lays out inline-block children like
  // `<MSG_REF_CHIP>` (`#proj-growth`) → overflow. tygg #wg-sharing:e1f749f8
  // 2026-05-24 first-principles fix.
  const screenshot = readFileSync(resolve(repoRoot, "src/utils/selectScreenshot.ts"), "utf8");

  assert.match(screenshot, /const liveWidth = nodes\[0\]\?\.getBoundingClientRect\(\)\.width \?\? 760;/);
  // Negative: must not regress to parentElement-based measurement.
  assert.doesNotMatch(
    screenshot,
    /const liveWidth =\s*nodes\[0\]\?\.parentElement\?\.getBoundingClientRect\(\)\.width/,
  );
});

test("download-as-image freezes markdown text metrics before rasterizing", () => {
  const screenshot = readFileSync(resolve(repoRoot, "src/utils/selectScreenshot.ts"), "utf8");

  assert.match(screenshot, /function freezeTextLineBoxesForScreenshot/);
  assert.match(screenshot, /\[data-message-selectable\] p/);
  assert.match(screenshot, /\[data-message-selectable\] li/);
  assert.match(screenshot, /\[data-message-selectable\] code/);
  assert.match(screenshot, /window\.getComputedStyle\(node\)/);
  assert.match(screenshot, /node\.style\.fontSize = fontSize/);
  assert.match(screenshot, /node\.style\.lineHeight = lineHeight/);

  const fontsReadyIndex = screenshot.indexOf("await document.fonts.ready;");
  const freezeIndex = screenshot.indexOf("freezeTextLineBoxesForScreenshot(container);");
  const rasterizeIndex = screenshot.indexOf("return await toPng(container");
  assert.ok(fontsReadyIndex >= 0, "font readiness wait should be explicit");
  assert.ok(freezeIndex > fontsReadyIndex, "line boxes must be frozen after fonts are ready");
  assert.ok(rasterizeIndex > freezeIndex, "line boxes must be frozen before html-to-image rasterizes");
});
