import { AtSign, BellOff, Hash, Pencil } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, Status } from "raft-ui";
import {
  ChatSidebarItem,
  ChatSidebarItemAside,
  ChatSidebarItemCount,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemIcon,
  ChatSidebarItemIndicator,
  ChatSidebarItemMetaIcon,
  ChatSidebarItemStatus,
  ChatSidebarItemSubtitle,
  ChatSidebarItemContent,
  ChatSidebarItemTitle,
} from "raft-ui";

const ITEMS = ["selected", "channel", "unread", "mention", "draft", "muted", "dm"] as const;

type ItemKey = (typeof ITEMS)[number];

export function ChatSidebarItemStatesComposition() {
  const [currentItem, setCurrentItem] = useState<ItemKey>("selected");

  return (
    <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
      <StateGroup title="Channel rows">
        <ChatSidebarItem
          active={currentItem === "selected"}
          onClick={() => setCurrentItem("selected")}
        >
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemContent>
            <ChatSidebarItemTitle>#proj-uiux</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Selected channel</ChatSidebarItemSubtitle>
          </ChatSidebarItemContent>
        </ChatSidebarItem>

        <ChatSidebarItem
          active={currentItem === "channel"}
          onClick={() => setCurrentItem("channel")}
        >
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemContent>
            <ChatSidebarItemTitle>#general</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Channel</ChatSidebarItemSubtitle>
          </ChatSidebarItemContent>
        </ChatSidebarItem>

        <ChatSidebarItem active={currentItem === "unread"} onClick={() => setCurrentItem("unread")}>
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemContent>
            <ChatSidebarItemTitle>#release</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Unread activity</ChatSidebarItemSubtitle>
          </ChatSidebarItemContent>
        </ChatSidebarItem>

        <ChatSidebarItem
          active={currentItem === "mention"}
          onClick={() => setCurrentItem("mention")}
        >
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemContent>
            <ChatSidebarItemTitle>#design</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Mention and badge</ChatSidebarItemSubtitle>
          </ChatSidebarItemContent>
          <ChatSidebarItemAside>
            <ChatSidebarItemIndicator role="img" aria-label="Mentioned you">
              <AtSign aria-hidden />
            </ChatSidebarItemIndicator>
            <ChatSidebarItemCount>12</ChatSidebarItemCount>
          </ChatSidebarItemAside>
        </ChatSidebarItem>
      </StateGroup>

      <StateGroup title="Metadata and direct messages">
        <ChatSidebarItem active={currentItem === "draft"} onClick={() => setCurrentItem("draft")}>
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemContent>
            <ChatSidebarItemTitle>#planning</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Draft</ChatSidebarItemSubtitle>
          </ChatSidebarItemContent>
          <ChatSidebarItemAside>
            <ChatSidebarItemMetaIcon role="img" aria-label="Draft">
              <Pencil aria-hidden />
            </ChatSidebarItemMetaIcon>
          </ChatSidebarItemAside>
        </ChatSidebarItem>

        <ChatSidebarItem active={currentItem === "muted"} onClick={() => setCurrentItem("muted")}>
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemContent>
            <ChatSidebarItemTitle>#announcements</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Muted</ChatSidebarItemSubtitle>
          </ChatSidebarItemContent>
          <ChatSidebarItemAside>
            <ChatSidebarItemMetaIcon role="img" aria-label="Activity muted">
              <BellOff aria-hidden />
            </ChatSidebarItemMetaIcon>
          </ChatSidebarItemAside>
        </ChatSidebarItem>

        <ChatSidebarItem active={currentItem === "dm"} onClick={() => setCurrentItem("dm")}>
          <ChatSidebarItemIcon>
            <Avatar size="2xs" type="human">
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
          </ChatSidebarItemIcon>
          <ChatSidebarItemContent>
            <ChatSidebarItemTitle>Cindy</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Direct message</ChatSidebarItemSubtitle>
          </ChatSidebarItemContent>
          <ChatSidebarItemAside>
            <ChatSidebarItemStatus>
              <Status aria-label="Online" size="xs" variant="success" />
            </ChatSidebarItemStatus>
            <ChatSidebarItemCount>4</ChatSidebarItemCount>
          </ChatSidebarItemAside>
        </ChatSidebarItem>
      </StateGroup>
    </div>
  );
}

function StateGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0">
      <h2 className="mb-2 text-xs font-medium text-foreground-muted">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
