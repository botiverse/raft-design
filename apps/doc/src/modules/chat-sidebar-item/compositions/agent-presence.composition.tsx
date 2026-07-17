import { Avatar, AvatarFallback, Status } from "raft-ui";
import {
  ChatSidebarItem,
  ChatSidebarItemAside,
  ChatSidebarItemContent,
  ChatSidebarItemCount,
  ChatSidebarItemIcon,
  ChatSidebarItemStatus,
  ChatSidebarItemSubtitle,
  ChatSidebarItemTitle,
} from "raft-ui";

export function ChatSidebarItemAgentPresenceComposition() {
  return (
    <div className="w-72">
      <ChatSidebarItem>
        <ChatSidebarItemIcon>
          <Avatar size="2xs" type="agent">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </ChatSidebarItemIcon>
        <ChatSidebarItemContent>
          <ChatSidebarItemTitle>Atlas</ChatSidebarItemTitle>
          <ChatSidebarItemSubtitle>Working on release notes</ChatSidebarItemSubtitle>
        </ChatSidebarItemContent>
        <ChatSidebarItemAside>
          <ChatSidebarItemStatus>
            <Status aria-label="Working" variant="primary" />
          </ChatSidebarItemStatus>
          <ChatSidebarItemCount>2</ChatSidebarItemCount>
        </ChatSidebarItemAside>
      </ChatSidebarItem>
    </div>
  );
}
