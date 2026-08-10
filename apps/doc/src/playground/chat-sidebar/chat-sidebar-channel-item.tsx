import { useState, type ReactNode } from "react";
import { Archive, Bell, BellOff, Mail, MailOpen, Pin, PinOff } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  SidebarItem as SidebarItemRoot,
} from "raft-ui";

import {
  DEFAULT_CHANNEL_ID,
  type PlaygroundChannelId,
  type PlaygroundRoomChannelRecord,
} from "../mock/index.ts";
import { PlaygroundConversationLink } from "../navigation/conversation-link.tsx";
import { ChatSidebarChannelRowContent } from "./chat-sidebar-channel-row-content.tsx";
import { useChatSidebarDnd } from "./use-chat-sidebar-dnd.ts";

export function ChatSidebarChannelItem({
  activeChannelId,
  channel,
  children,
  onArchive,
}: {
  activeChannelId: PlaygroundChannelId | null;
  channel: PlaygroundRoomChannelRecord;
  children?: ReactNode;
  onArchive?: (channel: PlaygroundRoomChannelRecord) => void;
}) {
  const [unread, setUnread] = useState(() =>
    Boolean(channel.navigation.unread || channel.navigation.badge),
  );
  const [muted, setMuted] = useState(() => channel.navigation.muted === true);
  const [announcement, setAnnouncement] = useState("");
  const { isPinned, togglePinned } = useChatSidebarDnd();
  const active = activeChannelId === channel.id;
  const pinned = isPinned(channel.id);
  const canMute = !channel.archived;
  const canArchive =
    onArchive && channel.id !== DEFAULT_CHANNEL_ID && channel.kind !== "joint" && !channel.archived;

  function announce(message: string) {
    setAnnouncement("");
    queueMicrotask(() => setAnnouncement(message));
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <SidebarItemRoot
            active={active}
            variant="accent"
            aria-current={active ? "page" : undefined}
            render={<PlaygroundConversationLink conversation={channel} />}
          >
            {children ?? <ChatSidebarChannelRowContent row={channel} hideBadge={active} />}
            <span className="sr-only" aria-live="polite">
              {announcement}
            </span>
          </SidebarItemRoot>
        }
      />
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          onClick={() => {
            setUnread(!unread);
            announce(`${channel.name} marked as ${unread ? "read" : "unread"}`);
          }}
        >
          {unread ? <MailOpen /> : <Mail />}
          {unread ? "Mark as Read" : "Mark as Unread"}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            togglePinned(channel.id);
            announce(`${channel.name} ${pinned ? "unpinned" : "pinned"}`);
          }}
        >
          {pinned ? <PinOff /> : <Pin />}
          {pinned ? "Unpin" : "Pin"}
        </ContextMenuItem>
        {canMute ? (
          <ContextMenuItem
            onClick={() => {
              setMuted(!muted);
              announce(`${channel.name} ${muted ? "unmuted" : "muted"}`);
            }}
          >
            {muted ? <Bell /> : <BellOff />}
            {muted ? "Unmute" : "Mute"}
          </ContextMenuItem>
        ) : null}
        {canArchive ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onArchive(channel)}>
              <Archive />
              Archive
            </ContextMenuItem>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}
