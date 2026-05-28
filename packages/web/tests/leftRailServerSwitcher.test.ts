import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("desktop server switcher keeps long server lists inside the viewport", () => {
  // Post-extraction (task #234 ServerSwitcherMenu primitive): the desktop
  // LeftRail callsite owns the testId + max-h sizing (passed in via props);
  // the inner scrollable container + card chrome now live in the primitive.
  const leftRail = readFileSync(
    resolve(repoRoot, "src/components/layout/LeftRail.tsx"),
    "utf8",
  );
  const primitive = readFileSync(
    resolve(repoRoot, "src/components/ui/ServerSwitcherMenu.tsx"),
    "utf8",
  );

  // Callsite owns: testId + viewport-bounded max-h (sized for the desktop rail).
  assert.match(leftRail, /testId="desktop-server-switcher-menu"/);
  assert.match(leftRail, /max-h-\[calc\(100dvh-16px\)\]/);
  // Primitive owns: card chrome + the inner scroll region. Order in the
  // primitive is `card-brutal z-50 flex flex-col overflow-hidden`; assert
  // the load-bearing tokens rather than exact ordering.
  assert.match(primitive, /card-brutal/);
  assert.match(primitive, /flex flex-col overflow-hidden/);
  assert.match(primitive, /min-h-0 flex-1 overflow-y-auto overscroll-contain/);
});

test("server switcher navigation lets the route resolve the target server", () => {
  // Post-extraction: the navigate(`/s/${slug}`) call moved into the
  // primitive; both LeftRail and Sidebar consume the primitive and so
  // share this behavior. Assert it once at the source of truth.
  const primitive = readFileSync(
    resolve(repoRoot, "src/components/ui/ServerSwitcherMenu.tsx"),
    "utf8",
  );

  assert.match(primitive, /navigate\(`\/s\/\$\{s\.slug\}`\);/);
  // The URL must be the source of truth — no direct setCurrentServer(s)
  // call wrapped around the navigation. ServerResolver flips `current`
  // after the route lands.
  assert.doesNotMatch(
    primitive,
    /setCurrentServer\(s\);\s*navigate\(`\/s\/\$\{s\.slug\}`\);/,
  );
});

test("rail tabs hover to opaque white, not translucent gray", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/layout/LeftRail.tsx"),
    "utf8",
  );

  assert.match(source, /border-transparent hover:border-black hover:bg-white"/);
  assert.doesNotMatch(source, /hover:bg-white\/70/);
});

test("chat rail tab shows an icon-anchored unread dot only while inactive", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/layout/LeftRail.tsx"),
    "utf8",
  );

  assert.match(source, /useInboxStore\(\(s\) => s\.totalUnreadCount\)/);
  assert.match(
    source,
    /inboxTotalUnreadCount > 0 \|\| Object\.values\(unreadCounts\)\.some\(\(count\) => count > 0\)/,
  );
  assert.match(source, /label="Chat"[\s\S]*?showDot=\{hasChatUnread\}/);
  assert.match(source, /dotInactiveOnly/);
  assert.match(source, /dotTitle="Unread messages"/);
  assert.match(source, /<span className="relative inline-flex items-center justify-center">/);
  assert.match(source, /showDot && \(!dotInactiveOnly \|\| !active\) && \(/);
  // Rail-tab attention dot goes through the canonical <AttentionDot>
  // helper at `size="lg"` — the default canonical 10×10 tier. See
  // CLAUDE.md "Attention Dots": size is physical fit, not priority. The
  // rail tab corner has room for `lg`, so it uses the canonical default.
  // Don't drop back to an inline span; the helper centralizes the
  // size/border/color so every dot in the app tracks the locked physical-
  // fit axis. Don't reintroduce `size="md"` — that tier was removed in
  // PR #1709 amend (stdrc 2026-05-14, msg=6ad15567).
  assert.match(source, /import AttentionDot from "\.\.\/ui\/AttentionDot";/);
  assert.match(source, /<AttentionDot[\s\S]{0,200}size="lg"[\s\S]{0,200}-right-1 -top-1/);
});
