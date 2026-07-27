import type { PlaygroundChannelId } from "../mock/index.ts";

export type ChatSidebarDragSection = "pinned" | "joint" | "channels" | "dms";

const PLAYGROUND_SIDEBAR_ITEM_PREFIX = "playground-chat-sidebar:item:";
const PLAYGROUND_SECTION_DROP_TARGET_PREFIX = "playground-chat-sidebar:section:";

export function createChatSidebarDragId(
  _section: ChatSidebarDragSection,
  channelId: PlaygroundChannelId,
) {
  return `${PLAYGROUND_SIDEBAR_ITEM_PREFIX}${channelId}`;
}

export function createChatSidebarDropTargetId(section: ChatSidebarDragSection) {
  return `${PLAYGROUND_SECTION_DROP_TARGET_PREFIX}${section}`;
}

export type ChatSidebarDragItemData = {
  kind: "item";
  section: ChatSidebarDragSection;
  channelId: PlaygroundChannelId;
  active: boolean;
};

export type ChatSidebarDropTargetData = {
  kind: "section";
  section: ChatSidebarDragSection;
  empty: boolean;
};

export function readChatSidebarDragItemData(value: unknown): ChatSidebarDragItemData | null {
  if (
    !value ||
    typeof value !== "object" ||
    !("kind" in value) ||
    value.kind !== "item" ||
    !("section" in value) ||
    !isChatSidebarDragSection(value.section) ||
    !("channelId" in value) ||
    typeof value.channelId !== "string" ||
    !("active" in value) ||
    typeof value.active !== "boolean"
  ) {
    return null;
  }
  return value as ChatSidebarDragItemData;
}

export function readChatSidebarDropTargetData(value: unknown): ChatSidebarDropTargetData | null {
  if (
    !value ||
    typeof value !== "object" ||
    !("kind" in value) ||
    value.kind !== "section" ||
    !("section" in value) ||
    !isChatSidebarDragSection(value.section) ||
    !("empty" in value) ||
    typeof value.empty !== "boolean"
  ) {
    return null;
  }
  return value as ChatSidebarDropTargetData;
}

export function parseChatSidebarDropTargetId(value: string): ChatSidebarDragSection | null {
  const section = value.slice(PLAYGROUND_SECTION_DROP_TARGET_PREFIX.length);
  return value.startsWith(PLAYGROUND_SECTION_DROP_TARGET_PREFIX) &&
    isChatSidebarDragSection(section)
    ? section
    : null;
}

function isChatSidebarDragSection(value: unknown): value is ChatSidebarDragSection {
  return (
    typeof value === "string" &&
    (value === "pinned" || value === "joint" || value === "channels" || value === "dms")
  );
}
