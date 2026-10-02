import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { Mail, MailOpen, Pin, PinOff, X } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  SidebarItem as SidebarItemRoot,
} from "raft-ui";

import type { PlaygroundChannelId, PlaygroundDirectMessageRecord } from "../mock/index.ts";
import { PlaygroundConversationLink } from "../navigation/conversation-link.tsx";
import { ChatSidebarDirectMessageRowContent } from "./chat-sidebar-direct-message-row-content.tsx";
import { useChatSidebarDnd } from "./use-chat-sidebar-dnd.ts";

export function ChatSidebarDirectMessageItem({
  activeChannelId,
  directMessage,
  children,
  onClose,
}: {
  activeChannelId: PlaygroundChannelId | null;
  directMessage: PlaygroundDirectMessageRecord;
  children?: ReactNode;
  onClose: (directMessage: PlaygroundDirectMessageRecord) => void;
}) {
  const [unread, setUnread] = useState(() =>
    Boolean(directMessage.navigation.unread || directMessage.navigation.badge),
  );
  const [announcement, setAnnouncement] = useState("");
  const { isPinned, togglePinned } = useChatSidebarDnd();
  const active = activeChannelId === directMessage.id;
  const pinned = isPinned(directMessage.id);

  const announce = useCallback((message: string) => {
    setAnnouncement("");
    queueMicrotask(() => setAnnouncement(message));
  }, []);
  const handleToggleUnread = useCallback(() => {
    setUnread(!unread);
    announce(`${directMessage.name} marked as ${unread ? "read" : "unread"}`);
  }, [announce, directMessage.name, unread]);
  const handleTogglePinned = useCallback(() => {
    togglePinned(directMessage.id);
    announce(`${directMessage.name} ${pinned ? "unpinned" : "pinned"}`);
  }, [announce, directMessage.id, directMessage.name, pinned, togglePinned]);
  const handleClose = useCallback(() => onClose(directMessage), [directMessage, onClose]);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <SidebarItemRoot
            active={active}
            variant="accent"
            aria-current={active ? "page" : undefined}
            render={<PlaygroundConversationLink conversation={directMessage} />}
          >
            {children ?? (
              <ChatSidebarDirectMessageRowContent row={directMessage} hideBadge={active} />
            )}
            <span className="sr-only" aria-live="polite">
              {announcement}
            </span>
          </SidebarItemRoot>
        }
      />
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleToggleUnread}>
          {unread ? <MailOpen /> : <Mail />}
          {unread ? "Mark as Read" : "Mark as Unread"}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleTogglePinned}>
          {pinned ? <PinOff /> : <Pin />}
          {pinned ? "Unpin" : "Pin"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleClose}>
          <X />
          Close Chat
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
