import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(repoRoot, path), "utf8");

// `ServerSwitcherMenu` is the single primitive for the "switch server"
// dropdown. The desktop LeftRail flyout and the mobile Sidebar pill
// drop-down used to inline 70+ identical lines each and drifted on the
// "current server row also shows its own unread badge" detail (LeftRail
// did, Sidebar didn't). The primitive collapses both into one and pins
// the canonical "current row hides unread" rule per stdrc decision C
// 2026-05-14 `#proj-uiux:24e533e3` task #234.

test("ServerSwitcherMenu primitive exists and exports the expected shape", () => {
  const src = read("src/components/ui/ServerSwitcherMenu.tsx");
  // Default export so callsites import as `ServerSwitcherMenu`.
  assert.match(src, /export default function ServerSwitcherMenu/);
  // Required props are stable contract.
  assert.match(src, /open: boolean/);
  assert.match(src, /onClose: \(\) => void/);
  assert.match(src, /serverUnreadCounts: Record<string, number>/);
  // Outside-click + ESC are owned inside the primitive.
  assert.match(src, /document\.addEventListener\("mousedown"/);
  assert.match(src, /e\.key === "Escape"/);
});

test("current server row hides its own unread badge (stdrc decision C)", () => {
  const src = read("src/components/ui/ServerSwitcherMenu.tsx");
  // The badge render must be gated by `!isCurrent`. Catches accidental
  // removal of the guard — which is exactly the drift we collapsed when
  // adopting the primitive (LeftRail used to render the current-server
  // badge; mobile Sidebar did not).
  assert.match(
    src,
    /\{!isCurrent && unread > 0 && \(/,
    "current server's own unread badge must be gated by !isCurrent",
  );
});

test("LeftRail and Sidebar consume the primitive; no inline switcher menu JSX remains", () => {
  const leftRail = read("src/components/layout/LeftRail.tsx");
  const sidebar = read("src/components/layout/Sidebar.tsx");

  // Both callsites import the primitive.
  assert.match(
    leftRail,
    /import ServerSwitcherMenu from "\.\.\/ui\/ServerSwitcherMenu"/,
  );
  assert.match(
    sidebar,
    /import ServerSwitcherMenu from "\.\.\/ui\/ServerSwitcherMenu"/,
  );

  // Both render the primitive.
  assert.match(leftRail, /<ServerSwitcherMenu\b/);
  assert.match(sidebar, /<ServerSwitcherMenu\b/);

  // The desktop + mobile test ids carried by the primitive's outer card
  // are preserved so existing tests / selectors continue to work.
  assert.match(leftRail, /testId="desktop-server-switcher-menu"/);
  assert.match(sidebar, /testId="mobile-server-switcher-menu"/);

  // Neither callsite should still inline the "Join Community" /
  // "Switch or Create Server" buttons that the primitive owns. If those
  // strings show up here, the inline menu came back.
  assert.doesNotMatch(
    leftRail,
    /Join Community/,
    "LeftRail must not inline the Join Community button — use the primitive",
  );
  assert.doesNotMatch(
    leftRail,
    /Switch or Create Server/,
    "LeftRail must not inline the Switch or Create Server button — use the primitive",
  );
  assert.doesNotMatch(
    sidebar,
    /Join Community/,
    "Sidebar must not inline the Join Community button — use the primitive",
  );
  assert.doesNotMatch(
    sidebar,
    /Switch or Create Server/,
    "Sidebar must not inline the Switch or Create Server button — use the primitive",
  );

  // joinCommunityServer lives inside the primitive; callsites must not
  // pull it from the store directly anymore.
  assert.doesNotMatch(
    leftRail,
    /joinCommunityServer/,
    "LeftRail must not reference joinCommunityServer — the primitive owns it",
  );
  assert.doesNotMatch(
    sidebar,
    /joinCommunityServer/,
    "Sidebar must not reference joinCommunityServer — the primitive owns it",
  );
});

test("no other file inlines the switcher menu's footer buttons", () => {
  // Catches the pattern coming back in a third surface (e.g. a future
  // mobile drawer or a settings page). `ServerSwitcherMenu.tsx` is the
  // only file allowed to render "Switch or Create Server"; "Join Community"
  // is also used by onboarding and is not unique to the switcher.
  const componentsDir = resolve(repoRoot, "src");
  let hits = "";
  try {
    hits = execSync(
      `grep -RnE 'Switch or Create Server' ${componentsDir}`,
      { encoding: "utf8" },
    );
  } catch (err: any) {
    if (err.status === 1) hits = "";
    else throw err;
  }
  // Allowlist:
  // - `ServerSwitcherMenu.tsx` — the primitive itself.
  // - `PaletteAuditPage.tsx` — palette audit page replicates the button
  //   styling as a sample, not a render of the menu.
  // - `ReleaseNotesPanel.tsx` — release notes refer to past features by
  //   name, not a render.
  const allowed = hits
    .split("\n")
    .filter(
      (line) =>
        line &&
        !line.includes("/components/ui/ServerSwitcherMenu.tsx") &&
        !line.includes("/pages/PaletteAuditPage.tsx") &&
        !line.includes("/components/settings/ReleaseNotesPanel.tsx"),
    )
    .join("\n");
  assert.equal(
    allowed.trim(),
    "",
    `server switcher footer buttons must only render via <ServerSwitcherMenu>:\n${allowed}`,
  );
});
