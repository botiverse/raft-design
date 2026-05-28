import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("Sidebar renders all non-archived channels without a membership filter", () => {
  const sidebar = readFileSync(resolve(repoRoot, "src/components/layout/Sidebar.tsx"), "utf8");

  assert.match(
    sidebar,
    /orderByIds\(channels\.filter\(\(channel\) => !channel\.archivedAt\), channelOrderIds\)/,
    "normal Channels section must include every non-archived channel returned by the server",
  );
  assert.match(
    sidebar,
    /\.filter\(\(c\): c is Channel => !!c && !c\.archivedAt\)/,
    "pinned channels must follow the same archived-only sidebar visibility rule",
  );
  assert.doesNotMatch(sidebar, /getSidebarVisibleChannels|isJoinedForSidebar/);
  assert.doesNotMatch(sidebar, /joined === false|joined !== false/);
});

test("Sidebar no longer owns a public-channel discovery or join entry point", () => {
  const sidebar = readFileSync(resolve(repoRoot, "src/components/layout/Sidebar.tsx"), "utf8");

  assert.doesNotMatch(sidebar, /PublicChannelDiscoveryDialog/);
  assert.doesNotMatch(sidebar, /showPublicChannelDiscovery|setShowPublicChannelDiscovery/);
  assert.doesNotMatch(sidebar, /onJoinChannel/);
  assert.doesNotMatch(sidebar, /Join Channel/);
  assert.match(sidebar, /Create Channel/);
  assert.match(sidebar, /Create Joint Channel/);
});

test("reverted channel discovery artifacts stay removed", () => {
  assert.equal(
    existsSync(resolve(repoRoot, "src/components/channel/PublicChannelDiscoveryDialog.tsx")),
    false,
    "the discovery dialog should not be available from the sidebar add menu",
  );
  assert.equal(
    existsSync(resolve(repoRoot, "src/utils/channelVisibility.ts")),
    false,
    "sidebar visibility should stay local to Sidebar instead of hiding unjoined channels via a helper",
  );
});

test("release notes do not advertise the reverted hidden-channel discovery behavior", () => {
  const releaseNotes = readFileSync(resolve(repoRoot, "src/components/settings/ReleaseNotesPanel.tsx"), "utf8");

  assert.doesNotMatch(releaseNotes, /Public channels you have not joined stay out of the sidebar/);
  assert.doesNotMatch(releaseNotes, /dedicated search-and-join entry point/);
});
