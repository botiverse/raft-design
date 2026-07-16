import type {
  PlaygroundChannelId,
  PlaygroundChannelRecord,
  PlaygroundDirectMessageRecord,
  PlaygroundRoomChannelRecord,
} from "../mock/index.ts";
import { ChatSidebarChannelItem } from "./chat-sidebar-channel-item.tsx";
import { ChatSidebarDirectMessageItem } from "./chat-sidebar-direct-message-item.tsx";
import { ChatSidebarPinnedRowContent } from "./chat-sidebar-pinned-row-content.tsx";

export function ChatSidebarPinnedItem({
  activeChannelId,
  conversation,
  onArchive,
  onCloseDm,
}: {
  activeChannelId: PlaygroundChannelId | null;
  conversation: PlaygroundChannelRecord;
  onArchive: (conversation: PlaygroundRoomChannelRecord) => void;
  onCloseDm: (conversation: PlaygroundDirectMessageRecord) => void;
}) {
  if (conversation.kind === "dm") {
    return (
      <ChatSidebarDirectMessageItem
        activeChannelId={activeChannelId}
        directMessage={conversation}
        onClose={onCloseDm}
      >
        <ChatSidebarPinnedRowContent
          row={conversation}
          hideBadge={activeChannelId === conversation.id}
        />
      </ChatSidebarDirectMessageItem>
    );
  }

  return (
    <ChatSidebarChannelItem
      activeChannelId={activeChannelId}
      channel={conversation}
      onArchive={onArchive}
    >
      <ChatSidebarPinnedRowContent
        row={conversation}
        hideBadge={activeChannelId === conversation.id}
      />
    </ChatSidebarChannelItem>
  );
}
