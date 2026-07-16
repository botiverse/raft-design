import type { PlaygroundDirectMessage, PlaygroundRoomChannel } from "../mock/index.ts";
import { ChatSidebarChannelRowContent } from "./chat-sidebar-channel-row-content.tsx";
import { ChatSidebarDirectMessageRowContent } from "./chat-sidebar-direct-message-row-content.tsx";

export function ChatSidebarPinnedRowContent({
  row,
  hideBadge,
}: {
  row: PlaygroundRoomChannel | PlaygroundDirectMessage;
  hideBadge?: boolean;
}) {
  return row.kind === "dm" ? (
    <ChatSidebarDirectMessageRowContent row={row} hideBadge={hideBadge} />
  ) : (
    <ChatSidebarChannelRowContent row={row} hideBadge={hideBadge} />
  );
}
