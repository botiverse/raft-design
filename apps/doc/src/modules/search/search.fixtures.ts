export type SearchEntityType = "channel" | "computer" | "agentDm" | "humanDm";

export type SearchEntitySubtitle =
  | { kind: "channel" }
  | { kind: "computer"; hostname: string | null }
  | { kind: "agentDm" }
  | { kind: "selfDm" }
  | { kind: "text"; text: string };

export type SearchEntityField = {
  value: string;
  priority: number;
};

export type SearchIdentityAvatarFixture =
  | { kind: "pixel"; key: "robot" | "cat" | "ghost" }
  | { kind: "image"; src: string };

export type SearchEntityFixture = {
  key: string;
  type: SearchEntityType;
  title: string;
  subtitle: SearchEntitySubtitle;
  fields: readonly SearchEntityField[];
  channelId: string | null;
  machineId: string | null;
  agentId: string | null;
  userId: string | null;
  archivedAt?: string;
  avatar?: SearchIdentityAvatarFixture;
  activity?: "active";
};

export type SearchSenderKind = "agent" | "human";

export type SearchSenderFixture = {
  id: string;
  kind: SearchSenderKind;
  label: string;
  handle: string;
  isCurrentUser?: boolean;
  avatar?: SearchIdentityAvatarFixture;
};

export type SearchChannelKind = "channel" | "dm";

export type SearchChannelFixture = {
  id: string;
  kind: SearchChannelKind;
  name: string;
  archivedAt?: string;
};

export type SearchMessageFixture = {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  createdAt: string;
  mentions: readonly string[];
  threadId: string | null;
  parentMessageId: string | null;
  parentMessageContent: string | null;
};

export const SEARCH_SENDER_FIXTURES: readonly SearchSenderFixture[] = [
  {
    id: "human-me",
    kind: "human",
    label: "Me",
    handle: "robin",
    isCurrentUser: true,
  },
  {
    id: "agent-atlas",
    kind: "agent",
    label: "Atlas",
    handle: "atlas",
    avatar: { kind: "pixel", key: "robot" },
  },
  {
    id: "human-maya",
    kind: "human",
    label: "Maya Chen",
    handle: "maya",
  },
  {
    id: "agent-patch",
    kind: "agent",
    label: "Patch",
    handle: "patch",
    avatar: { kind: "pixel", key: "cat" },
  },
];

export const SEARCH_CHANNEL_FIXTURES: readonly SearchChannelFixture[] = [
  { id: "channel-uiux", kind: "channel", name: "proj-uiux" },
  { id: "channel-release", kind: "channel", name: "proj-release" },
  {
    id: "channel-archive",
    kind: "channel",
    name: "proj-search-v1",
    archivedAt: "2026-05-01T08:00:00.000Z",
  },
  { id: "dm-atlas", kind: "dm", name: "Atlas" },
];

export const SEARCH_ENTITY_FIXTURES: readonly SearchEntityFixture[] = [
  {
    key: "channel:channel-uiux",
    type: "channel",
    title: "proj-uiux",
    subtitle: { kind: "channel" },
    fields: [
      { value: "proj-uiux", priority: 0 },
      { value: "UI systems, accessibility, and interaction review", priority: 3 },
    ],
    channelId: "channel-uiux",
    machineId: null,
    agentId: null,
    userId: null,
  },
  {
    key: "agent:agent-atlas",
    type: "agentDm",
    title: "Atlas",
    subtitle: { kind: "text", text: "@atlas" },
    fields: [
      { value: "Atlas", priority: 0 },
      { value: "atlas", priority: 1 },
      { value: "design-system reviewer preview composition", priority: 3 },
    ],
    channelId: "dm-atlas",
    machineId: null,
    agentId: "agent-atlas",
    userId: null,
    avatar: { kind: "pixel", key: "robot" },
    activity: "active",
  },
  {
    key: "human:human-maya",
    type: "humanDm",
    title: "Maya Chen",
    subtitle: { kind: "text", text: "Product designer" },
    fields: [
      { value: "Maya Chen", priority: 0 },
      { value: "maya", priority: 1 },
      { value: "product designer search preview accessibility", priority: 3 },
    ],
    channelId: null,
    machineId: null,
    agentId: null,
    userId: "human-maya",
  },
  {
    key: "computer:computer-orbit",
    type: "computer",
    title: "orbit-mac-studio",
    subtitle: { kind: "computer", hostname: "orbit.local" },
    fields: [
      { value: "orbit-mac-studio", priority: 0 },
      { value: "orbit.local", priority: 1 },
      { value: "preview build machine computer", priority: 3 },
    ],
    channelId: null,
    machineId: "computer-orbit",
    agentId: null,
    userId: null,
  },
  {
    key: "channel:channel-archive",
    type: "channel",
    title: "proj-search-v1",
    subtitle: { kind: "text", text: "Earlier search implementation notes" },
    fields: [
      { value: "proj-search-v1", priority: 0 },
      { value: "Earlier search implementation notes legacy archived", priority: 3 },
    ],
    channelId: "channel-archive",
    machineId: null,
    agentId: null,
    userId: null,
    archivedAt: "2026-05-01T08:00:00.000Z",
  },
];

export const SEARCH_MESSAGE_FIXTURES: readonly SearchMessageFixture[] = [
  {
    id: "message-standalone-preview",
    channelId: "channel-uiux",
    senderId: "human-maya",
    content:
      "The Search preview should keep one selected result and move real DOM focus with Arrow Up and Arrow Down.",
    createdAt: "2026-05-29T10:24:00.000Z",
    mentions: ["human-me"],
    threadId: null,
    parentMessageId: null,
    parentMessageContent: null,
  },
  {
    id: "message-thread-root-hit-1",
    channelId: "channel-uiux",
    senderId: "agent-atlas",
    content:
      "I mapped the Search composition filters to Base UI Combobox and Dropdown Menu so the preview keeps native keyboard behavior.",
    createdAt: "2026-05-29T09:42:00.000Z",
    mentions: ["human-me", "human-maya"],
    threadId: "thread-search-parity",
    parentMessageId: "message-thread-root-hit-1",
    parentMessageContent: "Search source-parity review",
  },
  {
    id: "message-thread-root-hit-2",
    channelId: "channel-uiux",
    senderId: "human-maya",
    content:
      "The grouped thread preview now announces the result count and highlights every query token.",
    createdAt: "2026-05-29T09:51:00.000Z",
    mentions: [],
    threadId: "thread-search-parity",
    parentMessageId: "message-thread-root-hit-1",
    parentMessageContent: "Search source-parity review",
  },
  {
    id: "message-thread-root-hit-3",
    channelId: "channel-uiux",
    senderId: "agent-patch",
    content:
      "Load More preserves the selected Search result while appending another deterministic preview page.",
    createdAt: "2026-05-29T09:58:00.000Z",
    mentions: ["human-me"],
    threadId: "thread-search-parity",
    parentMessageId: "message-thread-root-hit-1",
    parentMessageContent: "Search source-parity review",
  },
  {
    id: "message-release",
    channelId: "channel-release",
    senderId: "agent-patch",
    content:
      "Search preview checks are green; the composition is ready for the docs route and Playground wrapper.",
    createdAt: "2026-05-28T16:12:00.000Z",
    mentions: [],
    threadId: null,
    parentMessageId: null,
    parentMessageContent: null,
  },
  {
    id: "message-archived",
    channelId: "channel-archive",
    senderId: "human-me",
    content:
      "The archived Search prototype used a hand-written popover; keep it as history, not as the new composition.",
    createdAt: "2026-05-23T07:30:00.000Z",
    mentions: ["human-maya"],
    threadId: null,
    parentMessageId: null,
    parentMessageContent: null,
  },
  {
    id: "message-dm",
    channelId: "dm-atlas",
    senderId: "agent-atlas",
    content:
      "I can review the Search preview once the IME composition path and Escape behavior are wired.",
    createdAt: "2026-05-12T13:05:00.000Z",
    mentions: ["human-me"],
    threadId: null,
    parentMessageId: null,
    parentMessageContent: null,
  },
  {
    id: "message-older",
    channelId: "channel-release",
    senderId: "human-maya",
    content:
      "The original Search page used separate entity and message sections; preserve that scanning model.",
    createdAt: "2026-04-18T11:15:00.000Z",
    mentions: [],
    threadId: null,
    parentMessageId: null,
    parentMessageContent: null,
  },
];
