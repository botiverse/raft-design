import { AtSign, BellOff, Hash } from "lucide-react";
import {
  ChatSidebarItem,
  ChatSidebarItemAside,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemContent,
  ChatSidebarItemCount,
  ChatSidebarItemIndicator,
  ChatSidebarItemMetaIcon,
  ChatSidebarItemSubtitle,
  ChatSidebarItemTitle,
} from "raft-ui";

export function ChatSidebarItemMentionAndUnreadComposition() {
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
