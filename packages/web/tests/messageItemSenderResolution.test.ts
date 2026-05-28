import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import type { Message } from "../src/store/messageStore.js";
import type { User } from "../src/store/authStore.js";
import type { Server, ServerMember } from "../src/store/serverStore.js";
import type { Agent } from "../src/store/agentStore.js";
import type { Channel } from "../src/store/channelStore.js";

class MemoryStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string) {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.map.set(key, value);
  }

  removeItem(key: string) {
    this.map.delete(key);
  }
}

Object.defineProperty(globalThis, "localStorage", {
  value: new MemoryStorage(),
  configurable: true,
});
Object.defineProperty(globalThis, "sessionStorage", {
  value: new MemoryStorage(),
  configurable: true,
});

const repoRoot = resolve(import.meta.dirname, "..");
const { default: MessageItem } = await import("../src/components/message/MessageItem");
const { useAuthStore } = await import("../src/store/authStore");
const { useServerStore } = await import("../src/store/serverStore");
const { useAgentStore } = await import("../src/store/agentStore");
const { useChannelStore } = await import("../src/store/channelStore");

const authAvatarUrl = "/api/avatars/users/0123456789abcdef.webp";
const otherAvatarUrl = "/api/avatars/users/fedcba9876543210.webp";
const agentAvatarUrl = "/api/avatars/agents/abcdef0123456789.webp";
const previewAgentAvatarUrl = "/api/avatars/agents/9999999999999999.webp";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    email: "current@example.com",
    gravatarHash: "currenthash",
    name: "current",
    displayName: "Current User",
    description: "Auth profile description",
    avatarUrl: authAvatarUrl,
    emailVerified: true,
    preferredLanguage: null,
    preferredTimezone: null,
    autoTranslationEnabled: false,
    preferredTimeFormat: null,
    preferredMessageBodyFontSize: null,
    referralSource: null,
    referralSourceOther: null,
    referralSourceSkippedAt: null,
    ...overrides,
  };
}

function makeMember(overrides: Partial<ServerMember> = {}): ServerMember {
  return {
    userId: "user-1",
    email: "member@example.com",
    gravatarHash: "memberhash",
    name: "member",
    displayName: "Cached Member",
    description: "Cached description",
    avatarUrl: null,
    role: "member",
    joinedAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  };
}

function makeAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: "agent-1",
    name: "agent-one",
    displayName: "Agent One",
    avatarUrl: agentAvatarUrl,
    description: "Agent description",
    status: "active",
    model: "test-model",
    runtime: "codex",
    reasoningEffort: null,
    executionMode: "cloud",
    envVars: null,
    machineId: null,
    runtimeProfile: null,
    creatorType: null,
    creatorId: null,
    creator: null,
    createdAgents: [],
    deletedAt: null,
    createdAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  };
}

function makeAgentDmChannel(overrides: Partial<Channel> = {}): Channel {
  return {
    id: "channel-1",
    name: "jinc",
    description: null,
    type: "dm",
    createdAt: "2026-05-20T00:00:00.000Z",
    peerType: "agent",
    peerId: "agent-1",
    peerName: "jinc",
    peerDisplayName: "Jinc Display",
    peerDescription: null,
    peerAvatarUrl: null,
    peerGravatarHash: null,
    ...overrides,
  };
}

function makeServer(): Server {
  return {
    id: "server-1",
    name: "Server",
    slug: "server",
    ownerId: "user-1",
    onboardingAgentId: null,
    hideHumansFromMembers: false,
    plan: "free",
    planDowngradedAt: null,
    role: "member",
    createdAt: "2026-05-20T00:00:00.000Z",
  };
}

function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: "message-1",
    channelId: "channel-1",
    senderType: "user",
    senderId: "user-1",
    senderName: "Current User",
    messageType: "chat",
    content: "hello",
    createdAt: "2026-05-20T00:00:00.000Z",
    ...overrides,
  };
}

function resetStores(options: { user?: User | null; members?: ServerMember[]; agents?: Agent[]; dmChannels?: Channel[] } = {}) {
  const authState = {
    user: options.user === undefined ? makeUser() : options.user,
    accessToken: "token",
    refreshToken: "refresh",
    loading: false,
    initialized: true,
  };
  const serverState = {
    current: makeServer(),
    members: options.members ?? [],
  };
  const agentState = {
    agents: options.agents ?? [],
    agentActivities: {},
  };
  const channelState = {
    dmChannels: options.dmChannels ?? [],
  };

  useAuthStore.setState({
    ...authState,
  });
  useServerStore.setState({
    ...serverState,
  });
  useAgentStore.setState({
    ...agentState,
  });
  useChannelStore.setState({
    ...channelState,
  });

  // React's server renderer reads Zustand's captured initial snapshot through
  // useSyncExternalStore. Mutate that snapshot for this SSR-style render test
  // so MessageItem still exercises its real store selectors.
  Object.assign(useAuthStore.getInitialState(), authState);
  Object.assign(useServerStore.getInitialState(), serverState);
  Object.assign(useAgentStore.getInitialState(), agentState);
  Object.assign(useChannelStore.getInitialState(), channelState);
}

function renderMessage(message: Message, props: Record<string, unknown> = {}) {
  return renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(MessageItem, {
        message,
        mentionMap: new Map(),
        channels: [],
        hideThreadActions: true,
        ...props,
      }),
    ),
  );
}

test("MessageItem renders auth avatar for current user when member cache avatar is stale", () => {
  resetStores({ members: [makeMember({ avatarUrl: null })] });

  const html = renderMessage(makeMessage());

  assert.match(html, new RegExp(authAvatarUrl));
  assert.doesNotMatch(html, /www\.gravatar\.com/);
});

test("MessageItem renders auth avatar for current user when member cache is missing", () => {
  resetStores({ members: [] });

  const html = renderMessage(makeMessage());

  assert.match(html, new RegExp(authAvatarUrl));
});

test("MessageItem renders auth gravatar hash for current user when member cache and uploaded avatar are missing", () => {
  resetStores({ user: makeUser({ avatarUrl: null }), members: [] });

  const html = renderMessage(makeMessage());

  assert.match(html, /www\.gravatar\.com\/avatar\/currenthash/);
});

test("MessageItem keeps an email fallback diagnostic for old-session current users without auth gravatar hash", () => {
  resetStores({
    user: { ...makeUser({ avatarUrl: null }), gravatarHash: undefined as unknown as string },
    members: [],
  });

  const html = renderMessage(makeMessage());

  assert.match(html, /data-avatar-source="email-fallback"/);
  assert.match(html, /data-avatar-has-email-fallback="true"/);
});

test("MessageItem renders other users from member cache instead of auth profile", () => {
  resetStores({
    members: [
      makeMember({
        userId: "user-2",
        email: "other@example.com",
        name: "other",
        displayName: "Other User",
        avatarUrl: otherAvatarUrl,
      }),
    ],
  });

  const html = renderMessage(makeMessage({
    senderId: "user-2",
    senderName: "Other User",
  }));

  assert.match(html, new RegExp(otherAvatarUrl));
  assert.doesNotMatch(html, new RegExp(authAvatarUrl));
});

test("MessageItem resolves agent sender identity from agent store", () => {
  resetStores({ agents: [makeAgent()] });

  const html = renderMessage(makeMessage({
    senderType: "agent",
    senderId: "agent-1",
    senderName: "agent-one",
  }));

  assert.match(html, new RegExp(agentAvatarUrl));
  assert.match(html, />Agent One</);
  assert.doesNotMatch(html, />agent-one</);
  assert.match(html, /Agent description/);
});

test("MessageItem uses agent DM peer display name when agent profile displayName is missing", () => {
  resetStores({
    agents: [makeAgent({ displayName: null, name: "jinc" })],
    dmChannels: [makeAgentDmChannel()],
  });

  const html = renderMessage(makeMessage({
    channelId: "channel-1",
    senderType: "agent",
    senderId: "agent-1",
    senderName: "jinc",
  }));

  assert.match(html, />Jinc Display</);
  assert.doesNotMatch(html, />jinc</);
});

test("MessageItem preview sender override supports non-store preview agents", () => {
  resetStores({ agents: [] });

  const html = renderMessage(
    makeMessage({
      senderType: "agent",
      senderId: "preview-agent",
      senderName: "Preview Agent",
    }),
    {
      previewSenderAgent: makeAgent({
        id: "preview-agent",
        name: "preview-agent",
        displayName: "Preview Agent",
        avatarUrl: previewAgentAvatarUrl,
        description: "Preview-only sender",
      }),
    },
  );

  assert.match(html, new RegExp(previewAgentAvatarUrl));
  assert.match(html, /Preview-only sender/);
});

test("MessageItem is the only production sender identity resolver", () => {
  const messageItem = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");
  const chatPanel = readFileSync(resolve(repoRoot, "src/components/message/ChatPanel.tsx"), "utf8");
  const threadPanel = readFileSync(resolve(repoRoot, "src/components/message/ThreadPanel.tsx"), "utf8");
  const settingsPanel = readFileSync(resolve(repoRoot, "src/components/settings/SettingsPanel.tsx"), "utf8");

  assert.doesNotMatch(messageItem, /\bsenderAgent: Agent/);
  assert.doesNotMatch(messageItem, /\bsenderMember: ServerMember/);
  assert.match(messageItem, /\bpreviewSenderAgent\b/);
  assert.match(messageItem, /\bpreviewSenderMember\b/);
  assert.doesNotMatch(`${chatPanel}\n${threadPanel}`, /\bsenderAgent=|\bsenderMember=/);
  assert.match(settingsPanel, /\bpreviewSenderAgent=\{APPEARANCE_PREVIEW_AGENT\}/);
  assert.doesNotMatch(settingsPanel, /\bsenderAgent=|\bsenderMember=/);
});
