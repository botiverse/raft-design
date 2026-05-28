import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("human DM sidebar and header use uploaded avatar before silent Gravatar fallback", () => {
  const sidebar = readFileSync(resolve(repoRoot, "src/components/layout/Sidebar.tsx"), "utf8");
  const chatPanel = readFileSync(resolve(repoRoot, "src/components/message/ChatPanel.tsx"), "utf8");

  // Sidebar / ChatPanel now route avatars through the shared <AvatarSlot>
  // primitive (PR #1544 — wg-theme component-audit Tier 1). The original
  // `<GravatarAvatar gravatarHash={...peerGravatarHash}>` shape is gone;
  // the contract that survived is "human DM peers must read uploaded
  // peerAvatarUrl first, then silently fall back through peerGravatarHash,
  // never any ad-hoc fallback."
  assert.match(
    sidebar,
    /renderHumanDmItem[\s\S]*?<AvatarSlot[\s\S]*?type="human"[\s\S]*?humanAvatarUrl=\{dm\.peerAvatarUrl[\s\S]*?gravatarHash=\{dm\.peerGravatarHash/,
    "human DM sidebar items should pass uploaded avatar and Gravatar fallback to AvatarSlot",
  );
  assert.match(
    sidebar,
    /humanPlaceholder=\{!dm\.peerAvatarUrl && !dm\.peerGravatarHash\}/,
    "human DM sidebar items should only force placeholder when neither uploaded avatar nor Gravatar hash exists",
  );

  assert.match(
    chatPanel,
    /isUserDM[\s\S]*?<AvatarSlot[\s\S]*?type="human"[\s\S]*?humanAvatarUrl=\{dmAvatarUrl\}[\s\S]*?gravatarHash=\{channel\.peerGravatarHash/,
    "human DM header should pass uploaded avatar and Gravatar fallback to AvatarSlot",
  );
  assert.doesNotMatch(
    chatPanel,
    /userDmAvatarUrl/,
    "human DM header should use the shared DM avatar variable rather than a separate user-only path",
  );
});
