import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

// #proj-uiux task #269: the markdown attachment preview is capped to a byte
// prefix server-side (markdownPreviewProvider.streamByteCap). CsvPreviewPane
// and TextPreviewPane already surface `truncated`, but MarkdownPreviewPane
// silently dropped it, so a Cmd-F search for content past the cut produced no
// match and no explanation. These contract tests pin that the markdown pane
// receives and visibly declares the truncation boundary.

const repoRoot = resolve(import.meta.dirname, "..");
const source = readFileSync(
  resolve(repoRoot, "src/components/message/MessageItem.tsx"),
  "utf8",
);

test("MarkdownPreviewPane accepts a truncated prop", () => {
  assert.match(
    source,
    /function MarkdownPreviewPane\(\{\s*markdown,\s*truncated\s*\}:\s*\{\s*markdown:\s*string;\s*truncated:\s*boolean\s*\}\)/,
  );
});

test("the document preview modal forwards truncated into MarkdownPreviewPane", () => {
  assert.match(
    source,
    /<MarkdownPreviewPane\s+markdown=\{preview\.markdown\}\s+truncated=\{truncated\}\s*\/>/,
  );
  // Guard against a regression back to the unparameterized form.
  assert.doesNotMatch(
    source,
    /<MarkdownPreviewPane\s+markdown=\{preview\.markdown\}\s*\/>/,
  );
});

test("MarkdownPreviewPane renders a visible truncation banner gated on truncated", () => {
  const paneStart = source.indexOf("function MarkdownPreviewPane(");
  assert.ok(paneStart >= 0, "MarkdownPreviewPane present");
  const paneEnd = source.indexOf("\nfunction ", paneStart + 1);
  const pane = source.slice(paneStart, paneEnd === -1 ? undefined : paneEnd);

  assert.match(pane, /truncated \? \(/, "banner is gated on the truncated flag");
  assert.match(
    pane,
    /data-testid="markdown-preview-truncated"/,
    "banner exposes a stable test id",
  );
  assert.match(
    pane,
    /Preview truncated\./,
    "banner explains the preview is truncated",
  );
  assert.match(
    pane,
    /Download/,
    "banner points at the full-file Download affordance",
  );
  // Reuse pin (2026-05-19 audit, task #273): the truncation banner must go
  // through the shared <Banner intent="warning"> primitive — NOT a hand-rolled
  // bg-brutal-orange div (which drifted to /30 vs the primitive's canonical
  // /20). Locks the warning-surface single source.
  assert.match(
    pane,
    /<Banner\s+intent="warning"/,
    "truncation banner uses the shared <Banner intent=\"warning\"> primitive",
  );
  assert.doesNotMatch(
    pane,
    /bg-brutal-orange\/30/,
    "no hand-rolled orange banner — warning surface comes from the Banner primitive",
  );
});

test("markdown preview uses a browser-find friendly scroll root", () => {
  const shellStart = source.indexOf("function AttachmentPreviewShell(");
  assert.ok(shellStart >= 0, "AttachmentPreviewShell present");
  const shellEnd = source.indexOf("\nfunction ", shellStart + 1);
  const shell = source.slice(shellStart, shellEnd === -1 ? undefined : shellEnd);

  assert.match(
    shell,
    /layout = "fill"/,
    "attachment preview shell keeps fill layout as default",
  );
  assert.match(
    shell,
    /layout\?: "fill" \| "browser-find"/,
    "attachment preview shell exposes an explicit browser-find layout",
  );
  assert.match(
    shell,
    /positionClass=\{browserFindLayout \? "absolute left-0 right-0 top-0 min-h-screen" : undefined\}/,
    "browser-find layout contributes preview height to document scrolling",
  );
  assert.match(
    shell,
    /lockBodyScroll=\{!browserFindLayout\}/,
    "browser-find layout leaves window scrolling available for native find",
  );
  assert.match(
    shell,
    /scrollIntoViewOnMount=\{browserFindLayout\}/,
    "browser-find layout brings the document-flow preview overlay into view",
  );
  assert.match(
    shell,
    /data-testid=\{browserFindLayout \? "attachment-preview-browser-find-scroll" : undefined\}/,
    "browser-find layout exposes the preview root for browser verification",
  );
  assert.match(
    shell,
    /browserFindLayout[\s\S]{0,220}\? "safe-top safe-left pointer-events-auto sticky top-0/,
    "browser-find layout keeps the header sticky in normal flow",
  );

  assert.match(
    source,
    /layout=\{preview\.kind === "markdown" \? "browser-find" : "fill"\}/,
    "only markdown previews opt into the browser-find layout",
  );
});

test("Lightbox can opt out of fixed scroll-lock overlays for browser-find surfaces", () => {
  const lightboxSource = readFileSync(
    resolve(repoRoot, "src/components/ui/Lightbox.tsx"),
    "utf8",
  );

  assert.match(
    lightboxSource,
    /positionClass = "fixed inset-0"/,
    "default lightbox positioning remains fixed inset overlay",
  );
  assert.match(
    lightboxSource,
    /lockBodyScroll = true/,
    "default lightbox behavior still locks body scroll",
  );
  assert.match(
    lightboxSource,
    /html\.style\.overflow = "auto";[\s\S]{0,120}document\.body\.style\.overflow = "auto";/,
    "browser-find surfaces can leave document scrolling available",
  );
  assert.match(
    lightboxSource,
    /rootRef\.current\?\.scrollIntoView\(\{ block: "start" \}\)/,
    "document-flow overlays can move the viewport to the overlay on mount",
  );
  assert.match(
    lightboxSource,
    /className=\{`\$\{positionClass\} \$\{backdropClass\} \$\{className\}`\}/,
    "positioning is controlled by the explicit Lightbox prop",
  );
});

test("MarkdownPreviewPane does not own a nested overflow scroller", () => {
  const paneStart = source.indexOf("function MarkdownPreviewPane(");
  assert.ok(paneStart >= 0, "MarkdownPreviewPane present");
  const paneEnd = source.indexOf("\nfunction ", paneStart + 1);
  const pane = source.slice(paneStart, paneEnd === -1 ? undefined : paneEnd);

  assert.doesNotMatch(
    pane,
    /h-full overflow-auto/,
    "markdown preview content must not hide behind a nested scroller; Chrome find-in-page should scroll the shell",
  );
  assert.match(
    pane,
    /min-h-\[calc\(100vh-56px\)\]/,
    "markdown preview still fills the viewport under the preview header",
  );
});
