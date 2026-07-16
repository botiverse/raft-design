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
} from "raft-ui/wip";
import {
  ChatSidebarServer,
  ChatSidebarServerAvatar,
  ChatSidebarServerChevron,
  ChatSidebarServerIndicator,
  ChatSidebarServerLabel,
} from "../chat-sidebar-server-switcher";

export function ChatSidebarMobilePartsComposition() {
  const [selected, setSelected] = useState("raft-ui-migration");
  const [announcement, setAnnouncement] = useState({ message: "", sequence: 0 });

  function announce(message: string) {
    setAnnouncement((current) => ({ message, sequence: current.sequence + 1 }));
  }

  return (
    <ChatSidebarRoot className="h-dvh">
      <ChatSidebarHeader>
        <ChatSidebarServer
          title="Raft Playground"
          render={<button type="button" />}
          onClick={() => announce("Switched to Raft Playground")}
        >
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
        <span className="sr-only" aria-live="polite">
          <span key={announcement.sequence}>{announcement.message}</span>
        </span>
      </ChatSidebarHeader>
      <ChatSidebarBody>
        <ChatSidebarContent>
          <ChatSidebarGroupLabel>Workspace</ChatSidebarGroupLabel>
          <ChatSidebarList>
            <ChatSidebarItem
              active={selected === "raft-ui-migration"}
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
              active={selected === "weekly-priorities"}
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
