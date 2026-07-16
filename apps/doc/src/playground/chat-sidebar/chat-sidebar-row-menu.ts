import {
  DEFAULT_CHANNEL_ID,
  type PlaygroundDirectMessage,
  type PlaygroundRoomChannel,
} from "../mock/index.ts";

export type ChatSidebarRowMenu = {
  type: "channel" | "dm";
  name: string;
  unread: boolean;
  pinned: boolean;
  muted?: boolean;
  canMute?: boolean;
  canArchive?: boolean;
};

export function getChatSidebarRowMenu(
  row: PlaygroundRoomChannel | PlaygroundDirectMessage,
): ChatSidebarRowMenu {
  const unread = Boolean(row.navigation.unread || row.navigation.badge);
  if (row.kind === "dm") {
    return { type: "dm", name: row.name, unread, pinned: row.navigation.pinned === true };
  }
  return {
    type: "channel",
    name: row.name,
    unread,
    pinned: row.navigation.pinned === true,
    muted: row.navigation.muted === true,
    canMute: !row.archived,
    canArchive: row.id !== DEFAULT_CHANNEL_ID && row.kind !== "joint" && !row.archived,
  };
}
