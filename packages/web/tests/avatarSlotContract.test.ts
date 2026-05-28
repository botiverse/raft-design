import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

const avatarSlotSource = readFileSync(resolve(repoRoot, "src/components/ui/AvatarSlot.tsx"), "utf8");
const gravatarAvatarSource = readFileSync(resolve(repoRoot, "src/components/member/GravatarAvatar.tsx"), "utf8");
const settingsPanelSource = readFileSync(resolve(repoRoot, "src/components/settings/SettingsPanel.tsx"), "utf8");
const messageInputSource = readFileSync(resolve(repoRoot, "src/components/message/MessageInput.tsx"), "utf8");
const messageItemSource = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");
const agentDetailSource = readFileSync(resolve(repoRoot, "src/components/agent/AgentDetailPanel.tsx"), "utf8");
const quotedMessageCardSource = readFileSync(resolve(repoRoot, "src/components/ui/cards/QuotedMessageCard.tsx"), "utf8");
const searchPageSource = readFileSync(resolve(repoRoot, "src/components/search/MessageSearchPage.tsx"), "utf8");
const paletteAuditSource = readFileSync(resolve(repoRoot, "src/pages/PaletteAuditPage.tsx"), "utf8");

test("AvatarSlot carries role-keyed placeholder bg AND real images must fill the full frame", () => {
  // Role-keyed bg: agent = cyan, human = lavender (stdrc 2026-05-20
  // #proj-uiux:d7e5c75b). The bg is visible only when the inner content is a
  // placeholder/loading state; real avatar images cover it edge-to-edge.
  assert.match(
    avatarSlotSource,
    /const fallbackBg = type === "agent" \? "bg-brutal-cyan" : "bg-brutal-lavender";/,
    "AvatarSlot should derive a role-keyed placeholder bg (cyan agent / lavender human)",
  );
  assert.match(
    avatarSlotSource,
    /const baseClass = `flex shrink-0 items-center justify-center overflow-hidden \$\{spec\.size\} \$\{spec\.border\} border-black \$\{fallbackBg\}`;/,
    "AvatarSlot should compose the role bg into the canonical black-framed container",
  );

  // Fill invariant — real images must cover the bg edge-to-edge or the role
  // tint leaks around the image (the regression stdrc filed in #1873; this
  // test pins both sides so neither rule can silently drop again).
  assert.match(
    avatarSlotSource,
    /<AgentAvatar avatarUrl=\{agentAvatarUrl \?\? null\} size=\{spec\.agentPixel\} className="!w-full !h-full" \/>/,
    "agent avatars should fill the full frame edge-to-edge so role bg never leaks",
  );
  assert.match(
    gravatarAvatarSource,
    /gravatarLoaded\s*\?\s*"absolute inset-0 h-full w-full object-cover"/,
    "human Gravatar images should fill the full frame edge-to-edge so role bg never leaks",
  );
  assert.match(
    gravatarAvatarSource,
    /: "absolute inset-0 h-full w-full object-cover opacity-0 pointer-events-none"/,
    "pending human Gravatar probes should stay mounted and full-frame instead of display:none",
  );
});

test("known avatar surfaces do not reintroduce background-filled frames", () => {
  assert.doesNotMatch(
    settingsPanelSource,
    /bg-brutal-lavender[\s\S]{0,160}<GravatarAvatar|<AgentAvatar avatarUrl="pixel:random:cindy-preview"/,
    "Settings account and Appearance preview avatars must not use hand-rolled background frames",
  );
  assert.match(
    settingsPanelSource,
    /<AvatarSlot context="account-tile" type="human" humanAvatarUrl=\{user\?\.avatarUrl\} email=\{user\?\.email\} \/>/,
    "Settings account avatar should route through AvatarSlot",
  );
  assert.doesNotMatch(
    messageInputSource,
    /!bg-brutal-(cyan|lavender)/,
    "muted mention avatars should not add role-colored background fills",
  );
  assert.doesNotMatch(
    `${messageItemSource}\n${agentDetailSource}`,
    /!bg-gray-300 grayscale/,
    "deactivated agent avatars should not add gray background fills",
  );
  assert.doesNotMatch(
    searchPageSource,
    /result\.type === "agentDm"[\s\S]*?bg-brutal-cyan[\s\S]*?<Bot/,
    "search agent-DM fallbacks should use AvatarSlot instead of a cyan icon frame",
  );
  assert.doesNotMatch(
    paletteAuditSource,
    /avatar[\s\S]{0,200}bg-brutal-(cyan|lavender)|bg-brutal-(cyan|lavender)[\s\S]{0,200}avatar/,
    "palette avatar examples must document the no-fill AvatarSlot shape",
  );
});

test("compact quoted-message avatars route through AvatarSlot", () => {
  assert.match(
    quotedMessageCardSource,
    /<AvatarSlot context="compact-list" type="agent" agentAvatarUrl=\{author\.avatar \?\? null\} \/>/,
    "agent quote-preview avatars should use the shared avatar primitive",
  );
  assert.match(
    quotedMessageCardSource,
    /<AvatarSlot context="compact-list" type="human" humanAvatarUrl=\{author\.avatar \?\? null\} gravatarHash=\{author\.gravatarHash \?\? null\} \/>/,
    "human quote-preview avatars should use the shared avatar primitive",
  );
});
