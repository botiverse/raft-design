import { AtSign, BellOff, Hash, Pencil } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, Status } from "raft-ui";
import {
  ChatSidebarItem,
  ChatSidebarItemAside,
  ChatSidebarItemBadge,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemDraft,
  ChatSidebarItemIcon,
  ChatSidebarItemMention,
  ChatSidebarItemMuted,
  ChatSidebarItemPresence,
  ChatSidebarItemSubtitle,
  ChatSidebarItemText,
  ChatSidebarItemTitle,
  ChatSidebarItemUnread,
} from "raft-ui/wip";

const ITEMS = ["selected", "channel", "unread", "mention", "draft", "muted", "dm"] as const;

type ItemKey = (typeof ITEMS)[number];

export function ChatSidebarItemStatesComposition() {
  const [currentItem, setCurrentItem] = useState<ItemKey>("selected");

  return (
    <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
      <StateGroup title="Channel rows">
        <ChatSidebarItem
          aria-current={currentItem === "selected" ? "page" : undefined}
          onClick={() => setCurrentItem("selected")}
        >
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemText>
            <ChatSidebarItemTitle>#proj-uiux</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Selected channel</ChatSidebarItemSubtitle>
          </ChatSidebarItemText>
        </ChatSidebarItem>

        <ChatSidebarItem
          aria-current={currentItem === "channel" ? "page" : undefined}
          onClick={() => setCurrentItem("channel")}
        >
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemText>
            <ChatSidebarItemTitle>#general</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Channel</ChatSidebarItemSubtitle>
          </ChatSidebarItemText>
        </ChatSidebarItem>

        <ChatSidebarItemUnread
          aria-current={currentItem === "unread" ? "page" : undefined}
          onClick={() => setCurrentItem("unread")}
        >
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemText>
            <ChatSidebarItemTitle>#release</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Unread activity</ChatSidebarItemSubtitle>
          </ChatSidebarItemText>
        </ChatSidebarItemUnread>

        <ChatSidebarItemUnread
          aria-current={currentItem === "mention" ? "page" : undefined}
          onClick={() => setCurrentItem("mention")}
        >
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemText>
            <ChatSidebarItemTitle>#design</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Mention and badge</ChatSidebarItemSubtitle>
          </ChatSidebarItemText>
          <ChatSidebarItemAside>
            <ChatSidebarItemMention aria-label="Mentioned you">
              <AtSign aria-hidden />
            </ChatSidebarItemMention>
            <ChatSidebarItemBadge>12</ChatSidebarItemBadge>
          </ChatSidebarItemAside>
        </ChatSidebarItemUnread>
      </StateGroup>

      <StateGroup title="Metadata and direct messages">
        <ChatSidebarItem
          aria-current={currentItem === "draft" ? "page" : undefined}
          onClick={() => setCurrentItem("draft")}
        >
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemText>
            <ChatSidebarItemTitle>#planning</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Draft</ChatSidebarItemSubtitle>
          </ChatSidebarItemText>
          <ChatSidebarItemAside>
            <ChatSidebarItemDraft aria-label="Draft">
              <Pencil aria-hidden />
            </ChatSidebarItemDraft>
          </ChatSidebarItemAside>
        </ChatSidebarItem>

        <ChatSidebarItem
          aria-current={currentItem === "muted" ? "page" : undefined}
          onClick={() => setCurrentItem("muted")}
        >
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemText>
            <ChatSidebarItemTitle>#announcements</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Muted</ChatSidebarItemSubtitle>
          </ChatSidebarItemText>
          <ChatSidebarItemAside>
            <ChatSidebarItemMuted aria-label="Activity muted">
              <BellOff aria-hidden />
            </ChatSidebarItemMuted>
          </ChatSidebarItemAside>
        </ChatSidebarItem>

        <ChatSidebarItemUnread
          aria-current={currentItem === "dm" ? "page" : undefined}
          onClick={() => setCurrentItem("dm")}
        >
          <ChatSidebarItemIcon>
            <Avatar size="2xs" type="human">
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
          </ChatSidebarItemIcon>
          <ChatSidebarItemText>
            <ChatSidebarItemTitle>Cindy</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Direct message</ChatSidebarItemSubtitle>
          </ChatSidebarItemText>
          <ChatSidebarItemAside>
            <ChatSidebarItemPresence>
              <Status aria-label="Online" size="xs" variant="success" />
            </ChatSidebarItemPresence>
            <ChatSidebarItemBadge>4</ChatSidebarItemBadge>
          </ChatSidebarItemAside>
        </ChatSidebarItemUnread>
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
