import { Hash } from "lucide-react";
import {
  ChatSidebarItem,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemContent,
  ChatSidebarItemSubtitle,
  ChatSidebarItemTitle,
} from "raft-ui";

export function ChatSidebarItemSelectedChannelComposition() {
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
