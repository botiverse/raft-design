import { AtSign, BellOff, Hash } from "lucide-react";
import { Avatar, AvatarFallback, Status } from "raft-ui";
import {
  ChatSidebarItem,
  ChatSidebarItemAside,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemContent,
  ChatSidebarItemCount,
  ChatSidebarItemIcon,
  ChatSidebarItemIndicator,
  ChatSidebarItemMetaIcon,
  ChatSidebarItemStatus,
  ChatSidebarItemSubtitle,
  ChatSidebarItemTitle,
} from "raft-ui";

export function ChatSidebarItemSelectedComparison() {
  return (
    <div className="w-72">
      <ChatSidebarItem active>
        <ChatSidebarItemChannelIcon aria-hidden>
          <Hash />
        </ChatSidebarItemChannelIcon>
        <ChatSidebarItemContent>
          <ChatSidebarItemTitle>proj-uiux</ChatSidebarItemTitle>
          <ChatSidebarItemSubtitle>Cindy replied</ChatSidebarItemSubtitle>
        </ChatSidebarItemContent>
      </ChatSidebarItem>
    </div>
  );
}

export function ChatSidebarItemNotificationComparison() {
  return (
    <div className="w-72">
      <ChatSidebarItem>
        <ChatSidebarItemChannelIcon aria-hidden>
          <Hash />
        </ChatSidebarItemChannelIcon>
        <ChatSidebarItemContent>
          <ChatSidebarItemTitle>design</ChatSidebarItemTitle>
          <ChatSidebarItemSubtitle>Mentioned you</ChatSidebarItemSubtitle>
        </ChatSidebarItemContent>
        <ChatSidebarItemAside>
          <ChatSidebarItemIndicator role="img" aria-label="Mentioned you">
            <AtSign aria-hidden />
          </ChatSidebarItemIndicator>
          <ChatSidebarItemCount>12</ChatSidebarItemCount>
          <ChatSidebarItemMetaIcon role="img" aria-label="Activity muted">
            <BellOff aria-hidden />
          </ChatSidebarItemMetaIcon>
        </ChatSidebarItemAside>
      </ChatSidebarItem>
    </div>
  );
}

export function ChatSidebarItemDirectMessageComparison() {
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
            <Status aria-label="Working" size="xs" variant="primary" />
          </ChatSidebarItemStatus>
          <ChatSidebarItemCount>2</ChatSidebarItemCount>
        </ChatSidebarItemAside>
      </ChatSidebarItem>
    </div>
  );
}
