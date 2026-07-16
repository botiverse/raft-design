import { useState, type ReactElement, type ReactNode } from "react";
import { ContextMenu, ContextMenuTrigger } from "raft-ui";
import { ChatSidebarItem as ChatSidebarItemRoot } from "raft-ui/wip";

import {
  ChatSidebarItemContextMenuContent,
  type ChatSidebarItemMenuState,
} from "./chat-sidebar-item-context-menu-content.tsx";
import type { ChatSidebarRowMenu } from "./chat-sidebar-row-menu.ts";

export function PlaygroundChatSidebarItem({
  active,
  children,
  menu,
  onArchive,
  onCloseDm,
  render,
}: {
  active: boolean;
  children: ReactNode;
  menu: ChatSidebarRowMenu;
  onArchive?: () => void;
  onCloseDm?: () => void;
  render: ReactElement;
}) {
  const [menuState, setMenuState] = useState<ChatSidebarItemMenuState>(() => ({
    unread: menu.unread,
    pinned: menu.pinned,
    muted: menu.muted === true,
  }));
  const [announcement, setAnnouncement] = useState("");
  const announce = (message: string) => {
    setAnnouncement("");
    queueMicrotask(() => setAnnouncement(message));
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <ChatSidebarItemRoot
            active={active}
            aria-current={active ? "page" : undefined}
            render={render}
          >
            {children}
            <span className="sr-only" aria-live="polite">
              {announcement}
            </span>
          </ChatSidebarItemRoot>
        }
      />
      <ChatSidebarItemContextMenuContent
        menu={menu}
        state={menuState}
        onArchive={onArchive}
        onCloseDm={onCloseDm}
        onUnreadChange={(unread) => {
          setMenuState((state) => ({ ...state, unread }));
          announce(`${menu.name} marked as ${unread ? "unread" : "read"}`);
        }}
        onPinnedChange={(pinned) => {
          setMenuState((state) => ({ ...state, pinned }));
          announce(`${menu.name} ${pinned ? "pinned" : "unpinned"}`);
        }}
        onMutedChange={(muted) => {
          setMenuState((state) => ({ ...state, muted }));
          announce(`${menu.name} ${muted ? "muted" : "unmuted"}`);
        }}
      />
    </ContextMenu>
  );
}
