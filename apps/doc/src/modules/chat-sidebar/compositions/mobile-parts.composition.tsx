import { ChevronDown, Hash } from "lucide-react";
import { useState } from "react";
import { Status } from "raft-ui";
import {
  ChatSidebarBody,
  ChatSidebarContent,
  ChatSidebarGroupLabel,
  ChatSidebarHeader,
  ChatSidebarItem,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemText,
  ChatSidebarItemTitle,
  ChatSidebarList,
  ChatSidebarRoot,
  ChatSidebarServer,
  ChatSidebarServerAvatar,
  ChatSidebarServerChevron,
  ChatSidebarServerIndicator,
  ChatSidebarServerLabel,
} from "raft-ui/wip";

export function ChatSidebarMobilePartsComposition() {
  const [selected, setSelected] = useState("raft-ui-migration");

  return (
    <ChatSidebarRoot className="h-dvh">
      <ChatSidebarHeader>
        <ChatSidebarServer title="Raft Playground">
          <ChatSidebarServerAvatar>
            <img alt="" src="/android-chrome-192x192.png" />
          </ChatSidebarServerAvatar>
          <ChatSidebarServerLabel>Raft Playground</ChatSidebarServerLabel>
          <ChatSidebarServerChevron aria-hidden>
            <ChevronDown />
          </ChatSidebarServerChevron>
          <ChatSidebarServerIndicator>
            <Status aria-label="Other servers have unread messages" attention size="sm" />
          </ChatSidebarServerIndicator>
        </ChatSidebarServer>
      </ChatSidebarHeader>
      <ChatSidebarBody>
        <ChatSidebarContent>
          <ChatSidebarGroupLabel>Workspace</ChatSidebarGroupLabel>
          <ChatSidebarList>
            <ChatSidebarItem
              aria-current={selected === "raft-ui-migration" ? "page" : undefined}
              onClick={() => setSelected("raft-ui-migration")}
            >
              <ChatSidebarItemChannelIcon aria-hidden>
                <Hash />
              </ChatSidebarItemChannelIcon>
              <ChatSidebarItemText>
                <ChatSidebarItemTitle>raft-ui-migration</ChatSidebarItemTitle>
              </ChatSidebarItemText>
            </ChatSidebarItem>
            <ChatSidebarItem
              aria-current={selected === "weekly-priorities" ? "page" : undefined}
              onClick={() => setSelected("weekly-priorities")}
            >
              <ChatSidebarItemChannelIcon aria-hidden>
                <Hash />
              </ChatSidebarItemChannelIcon>
              <ChatSidebarItemText>
                <ChatSidebarItemTitle>weekly-priorities</ChatSidebarItemTitle>
              </ChatSidebarItemText>
            </ChatSidebarItem>
          </ChatSidebarList>
        </ChatSidebarContent>
      </ChatSidebarBody>
    </ChatSidebarRoot>
  );
}
