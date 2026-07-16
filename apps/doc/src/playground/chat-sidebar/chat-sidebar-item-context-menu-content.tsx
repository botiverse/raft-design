import { Archive, Bell, BellOff, Mail, MailOpen, Pin, PinOff, X } from "lucide-react";
import { ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "raft-ui";

import type { ChatSidebarRowMenu } from "./chat-sidebar-row-menu.ts";

export type ChatSidebarItemMenuState = {
  unread: boolean;
  pinned: boolean;
  muted: boolean;
};

export function ChatSidebarItemContextMenuContent({
  menu,
  state,
  onArchive,
  onCloseDm,
  onMutedChange,
  onPinnedChange,
  onUnreadChange,
}: {
  menu: ChatSidebarRowMenu;
  state: ChatSidebarItemMenuState;
  onArchive?: () => void;
  onCloseDm?: () => void;
  onMutedChange: (muted: boolean) => void;
  onPinnedChange: (pinned: boolean) => void;
  onUnreadChange: (unread: boolean) => void;
}) {
  return (
    <ContextMenuContent className="flex w-48 flex-col">
      <ContextMenuItem onClick={() => onUnreadChange(!state.unread)}>
        {state.unread ? <MailOpen /> : <Mail />}
        {state.unread ? "Mark as Read" : "Mark as Unread"}
      </ContextMenuItem>
      <ContextMenuItem onClick={() => onPinnedChange(!state.pinned)}>
        {state.pinned ? <PinOff /> : <Pin />}
        {state.pinned ? "Unpin" : "Pin"}
      </ContextMenuItem>
      {menu.type === "channel" && menu.canMute ? (
        <ContextMenuItem onClick={() => onMutedChange(!state.muted)}>
          {state.muted ? <Bell /> : <BellOff />}
          {state.muted ? "Unmute" : "Mute"}
        </ContextMenuItem>
      ) : null}
      {menu.type === "channel" && menu.canArchive ? (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onArchive}>
            <Archive />
            Archive
          </ContextMenuItem>
        </>
      ) : null}
      {menu.type === "dm" ? (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onCloseDm}>
            <X />
            Close Chat
          </ContextMenuItem>
        </>
      ) : null}
    </ContextMenuContent>
  );
}
