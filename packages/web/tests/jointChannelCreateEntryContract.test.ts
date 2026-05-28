import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("sidebar plus exposes joint channel as a botiverse-only first-level create entry", () => {
  const sidebar = readFileSync(resolve(repoRoot, "src/components/layout/Sidebar.tsx"), "utf8");

  assert.match(sidebar, /const canCreateJointChannel = server\?\.slug === "botiverse"/);
  assert.match(sidebar, /Create Joint Channel/);
  assert.match(sidebar, /CreateJointChannelDialog/);
  assert.match(sidebar, /showCreateJointChannel &&/);
  assert.match(sidebar, /\{canCreateJointChannel && \(\s*<MenuItem[\s\S]*?Create Joint Channel/);
  assert.match(sidebar, /showCreateJointChannel && canCreateJointChannel &&/);
  assert.match(sidebar, /openCreateJointChannelDialog\(\)/);
  assert.doesNotMatch(sidebar, /border-t-2 border-black px-3 py-2[\s\S]{0,240}Create Joint Channel/);
  assert.doesNotMatch(sidebar, /openCreateChannelDialog\("joint"\)/);
  assert.doesNotMatch(sidebar, /prefilledVisibility=\{createChannelVisibility\}/);
});

test("sidebar renders joint channels in their own section above ordinary channels", () => {
  const sidebar = readFileSync(resolve(repoRoot, "src/components/layout/Sidebar.tsx"), "utf8");

  assert.match(sidebar, /orderedJointChannels/);
  assert.match(sidebar, /sortableJointChannels/);
  assert.match(sidebar, /Joint Channels/);
  assert.match(sidebar, /data-testid="sidebar-section-toggle-joint-channels"/);
  assert.match(sidebar, /orderedRegularChannels/);
  assert.ok(sidebar.indexOf("Joint Channels") < sidebar.indexOf("{/* Channels */}"));
  assert.match(sidebar, /pinnedChannelIds\.includes\(channel\.id\)/);
});

test("ordinary channel dialog does not own joint-channel creation", () => {
  const dialog = readFileSync(resolve(repoRoot, "src/components/channel/CreateChannelDialog.tsx"), "utf8");
  const sidebar = readFileSync(resolve(repoRoot, "src/components/layout/Sidebar.tsx"), "utf8");

  assert.match(dialog, /prefilledVisibility\?: "public" \| "private"/);
  assert.doesNotMatch(dialog, /Invite server slug/);
  assert.doesNotMatch(dialog, /value: "joint"/);
  assert.doesNotMatch(sidebar, /<CreateChannelDialog[\s\S]{0,240}visibility: "joint"/);
  assert.doesNotMatch(sidebar, /<CreateChannelDialog[\s\S]{0,240}targetServerSlug/);
});

test("joint channel dialog requires an invite server slug and directed invitees", () => {
  const dialog = readFileSync(resolve(repoRoot, "src/components/channel/CreateJointChannelDialog.tsx"), "utf8");

  assert.match(dialog, /Create Joint Channel/);
  assert.match(dialog, /label="Invite server slug" required/);
  assert.match(dialog, /label="Invited people" required/);
  assert.match(dialog, /visibility: "joint"/);
  assert.match(dialog, /Invite server slug is required/);
  assert.match(dialog, /At least one invited person is required/);
  assert.match(dialog, /invitedPeople/);
});

test("joint channel chrome uses a distinct connected-server surface", () => {
  const chatPanel = readFileSync(resolve(repoRoot, "src/components/message/ChatPanel.tsx"), "utf8");
  const sidebar = readFileSync(resolve(repoRoot, "src/components/layout/Sidebar.tsx"), "utf8");
  const channelKindIcon = readFileSync(resolve(repoRoot, "src/components/channel/channelKindIcon.tsx"), "utf8");
  const editDialog = readFileSync(resolve(repoRoot, "src/components/channel/EditChannelDialog.tsx"), "utf8");

  assert.match(chatPanel, /<ChannelKindIcon type=\{channel\.type\}/);
  assert.match(sidebar, /<ChannelKindIcon type=\{channel\.type\}/);
  assert.match(channelKindIcon, /export const CHANNEL_KIND_ICON_SIZE = 14/);
  assert.match(channelKindIcon, /if \(type === "private"\) return <Lock size=\{size\}/);
  assert.match(channelKindIcon, /if \(type === "joint"\) return <GitBranch size=\{size\}/);
  assert.match(channelKindIcon, /if \(type === "channel"\) return <Hash size=\{size\}/);
  assert.match(chatPanel, /const channelSubtitle =\s*isRegularChannel\s*\?\s*channel\.description \|\| undefined\s*:\s*undefined;/);
  assert.doesNotMatch(chatPanel, /Joint with \$\{channel\.jointPeerServerName \|\| channel\.jointPeerServerSlug\}/);
  assert.match(editDialog, /Connected server:/);
  assert.match(editDialog, /Joint Channel/);
  assert.match(editDialog, /!isJointChannel &&/);
});

test("joint channels can edit shared metadata but cannot change visibility", () => {
  const editDialog = readFileSync(resolve(repoRoot, "src/components/channel/EditChannelDialog.tsx"), "utf8");

  assert.match(editDialog, /const isJointChannel = channel\?\.type === "joint"/);
  assert.match(editDialog, /disabled=\{isAllChannel \|\| isArchived\}/);
  assert.match(editDialog, /disabled=\{isArchived\}/);
  assert.match(editDialog, /disabled=\{saving \|\| isArchived\}/);
  assert.match(editDialog, /Joint channel names are shared across servers/);
  assert.match(editDialog, /!\s*isJointChannel && \(/);
  assert.doesNotMatch(editDialog, /isJointChannel[\s\S]{0,240}Make Public/);
  assert.doesNotMatch(editDialog, /isJointChannel[\s\S]{0,240}Make Private/);
  assert.match(editDialog, /Disconnect Joint Channel/);
  assert.match(editDialog, /disconnectJointChannel\(channelId\)/);
  assert.doesNotMatch(editDialog, /isJointChannel[\s\S]{0,200}<Trash2 size=\{14\} \/>[\s\S]{0,80}Delete Channel/);
});

test("joint member list labels peer agents and humans with source server beside display name", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/agent/ChannelMembers.tsx"), "utf8");

  assert.match(source, /function JointPeerBadge/);
  assert.doesNotMatch(source, /Joint · \{label\}/);
  assert.match(source, /const peerLabel = jointPeerLabel\(agent\.serverId, agent\.serverName, agent\.serverSlug\);/);
  assert.match(source, /<span className="truncate">\{agent\.displayName \|\| agent\.name\}<\/span>\s*\{peerLabel && <JointPeerBadge label=\{peerLabel\} \/>}/);
  assert.match(source, /const peerLabel = jointPeerLabel\(human\.serverId, human\.serverName, human\.serverSlug\);/);
  assert.match(source, /<span className="truncate">\{human\.displayName \|\| human\.name\}<\/span>\s*\{peerLabel && <JointPeerBadge label=\{peerLabel\} \/>}/);
  assert.doesNotMatch(source, /jointPeerLabel=\{jointPeerLabel\(human\.serverId, human\.serverName, human\.serverSlug\)\}/);
});

test("joint channels do not expose task surfaces in the main composer or tab bar", () => {
  const chatPanel = readFileSync(resolve(repoRoot, "src/components/message/ChatPanel.tsx"), "utf8");

  assert.match(chatPanel, /channel\?\.type === "joint" \? orderedTabs\.filter\(\(tab\) => tab\.id !== "tasks"\) : orderedTabs/);
  assert.match(chatPanel, /const supportsChannelTasks = channel\?\.type !== "joint";/);
  assert.match(chatPanel, /if \(!channel \|\| !supportsChannelTasks\) return;/);
  assert.match(chatPanel, /showTaskButton=\{supportsChannelTasks\}/);
  assert.doesNotMatch(chatPanel, /showTaskButton\s*\n\s*autoFocus/);

  const messageItem = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");
  assert.match(messageItem, /const supportsMessageTasks = taskSurfaceChannel\?\.type !== "joint";/);
  assert.match(messageItem, /!\s*parentMessageId && supportsMessageTasks && \(/);
});

test("joint message senders resolve avatars from aggregated channel membership", () => {
  const chatPanel = readFileSync(resolve(repoRoot, "src/components/message/ChatPanel.tsx"), "utf8");
  const threadPanel = readFileSync(resolve(repoRoot, "src/components/message/ThreadPanel.tsx"), "utf8");
  const messageItem = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");

  for (const source of [chatPanel, threadPanel]) {
    assert.match(source, /for \(const a of mentionChannelAgents\) map\.set\(a\.id, a\);/);
    assert.match(source, /for \(const human of mentionChannelHumans\)/);
    assert.match(source, /userId: human\.id/);
    assert.match(source, /avatarUrl: human\.avatarUrl/);
    assert.match(source, /gravatarHash: human\.gravatarHash/);
  }
  assert.match(messageItem, /senderAgent\?\.description \|\| message\.senderDescription \|\| null/);
});
