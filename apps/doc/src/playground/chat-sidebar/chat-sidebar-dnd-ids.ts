import type { PlaygroundChannelId } from "../mock/index.ts";

export type ChatSidebarDragSection = "pinned" | "joint" | "channels" | "dms";

export const PLAYGROUND_PINNED_DROP_TARGET_ID = "playground-chat-sidebar:pinned";

export function createChatSidebarDragId(
  section: ChatSidebarDragSection,
  channelId: PlaygroundChannelId,
) {
  return `${section}:${channelId}`;
}

export function parseChatSidebarDragId(value: string): {
  section: ChatSidebarDragSection;
  channelId: PlaygroundChannelId;
} | null {
  const separator = value.indexOf(":");
  if (separator <= 0 || separator === value.length - 1) return null;
  const section = value.slice(0, separator);
  if (section !== "pinned" && section !== "joint" && section !== "channels" && section !== "dms") {
    return null;
  }
  return { section, channelId: value.slice(separator + 1) as PlaygroundChannelId };
}
