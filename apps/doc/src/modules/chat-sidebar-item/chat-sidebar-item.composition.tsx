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
  ChatSidebarItemMeta,
  ChatSidebarItemMetaIcon,
  ChatSidebarItemStatus,
  ChatSidebarItemSubtitle,
  ChatSidebarItemContent,
  ChatSidebarItemTitle,
} from "raft-ui";

export function ChatSidebarItemStatesComposition() {
  const [currentItem, setCurrentItem] = useState("selected");

  return (
    <div className="grid w-full max-w-2xl gap-y-6 md:grid-cols-2 md:gap-x-[36px]">
      <StateGroup title="Channel rows">
        {/* @docs-source-strip-start */}
        <StateLabel>Selected channel</StateLabel>
        {/* @docs-source-strip-end */}
        <ChatSidebarItem
          active={currentItem === "selected"}
          onClick={() => setCurrentItem("selected")}
        >
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemContent>
            <ChatSidebarItemTitle>proj-uiux</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Cindy replied</ChatSidebarItemSubtitle>
          </ChatSidebarItemContent>
        </ChatSidebarItem>

        {/* @docs-source-strip-start */}
        <StateLabel>Channel with timestamp</StateLabel>
        {/* @docs-source-strip-end */}
        <ChatSidebarItem
          active={currentItem === "channel"}
          onClick={() => setCurrentItem("channel")}
        >
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemContent>
            <ChatSidebarItemTitle>general</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Ken shared a spec</ChatSidebarItemSubtitle>
            <ChatSidebarItemMeta>2h</ChatSidebarItemMeta>
          </ChatSidebarItemContent>
        </ChatSidebarItem>

        {/* @docs-source-strip-start */}
        <StateLabel>Menu open</StateLabel>
        {/* @docs-source-strip-end */}
        <ChatSidebarItem
          data-popup-open
          active={currentItem === "popup"}
          onClick={() => setCurrentItem("popup")}
        >
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemContent>
            <ChatSidebarItemTitle>community</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>New pinned message</ChatSidebarItemSubtitle>
          </ChatSidebarItemContent>
        </ChatSidebarItem>

        {/* @docs-source-strip-start */}
        <StateLabel>Unread count and draft</StateLabel>
        {/* @docs-source-strip-end */}
        <ChatSidebarItem active={currentItem === "unread"} onClick={() => setCurrentItem("unread")}>
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemContent>
            <ChatSidebarItemTitle>release</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Build 4.2 shipped</ChatSidebarItemSubtitle>
          </ChatSidebarItemContent>
          <ChatSidebarItemAside>
            <ChatSidebarItemCount>3</ChatSidebarItemCount>
            <ChatSidebarItemMetaIcon role="img" aria-label="Draft">
              <Pencil aria-hidden />
            </ChatSidebarItemMetaIcon>
          </ChatSidebarItemAside>
        </ChatSidebarItem>

        {/* @docs-source-strip-start */}
        <StateLabel>Mention, unread count, and muted</StateLabel>
        {/* @docs-source-strip-end */}
        <ChatSidebarItem
          active={currentItem === "mention"}
          onClick={() => setCurrentItem("mention")}
        >
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
      </StateGroup>

      <StateGroup title="Metadata and direct messages">
        {/* @docs-source-strip-start */}
        <StateLabel>Draft</StateLabel>
        {/* @docs-source-strip-end */}
        <ChatSidebarItem active={currentItem === "draft"} onClick={() => setCurrentItem("draft")}>
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemContent>
            <ChatSidebarItemTitle>planning</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Draft</ChatSidebarItemSubtitle>
          </ChatSidebarItemContent>
          <ChatSidebarItemAside>
            <ChatSidebarItemMetaIcon role="img" aria-label="Draft">
              <Pencil aria-hidden />
            </ChatSidebarItemMetaIcon>
          </ChatSidebarItemAside>
        </ChatSidebarItem>

        {/* @docs-source-strip-start */}
        <StateLabel>Muted</StateLabel>
        {/* @docs-source-strip-end */}
        <ChatSidebarItem active={currentItem === "muted"} onClick={() => setCurrentItem("muted")}>
          <ChatSidebarItemChannelIcon aria-hidden>
            <Hash />
          </ChatSidebarItemChannelIcon>
          <ChatSidebarItemContent>
            <ChatSidebarItemTitle>announcements</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Muted</ChatSidebarItemSubtitle>
          </ChatSidebarItemContent>
          <ChatSidebarItemAside>
            <ChatSidebarItemMetaIcon role="img" aria-label="Activity muted">
              <BellOff aria-hidden />
            </ChatSidebarItemMetaIcon>
          </ChatSidebarItemAside>
        </ChatSidebarItem>

        {/* @docs-source-strip-start */}
        <StateLabel>Agent activity</StateLabel>
        {/* @docs-source-strip-end */}
        <ChatSidebarItem active={currentItem === "agent"} onClick={() => setCurrentItem("agent")}>
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

        {/* @docs-source-strip-start */}
        <StateLabel>Direct message</StateLabel>
        {/* @docs-source-strip-end */}
        <ChatSidebarItem active={currentItem === "dm"} onClick={() => setCurrentItem("dm")}>
          <ChatSidebarItemIcon>
            <Avatar size="2xs" type="human">
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
          </ChatSidebarItemIcon>
          <ChatSidebarItemContent>
            <ChatSidebarItemTitle>Cindy</ChatSidebarItemTitle>
            <ChatSidebarItemSubtitle>Sent you a file</ChatSidebarItemSubtitle>
          </ChatSidebarItemContent>
          <ChatSidebarItemAside>
            <ChatSidebarItemStatus>
              <Status aria-label="Online" variant="success" />
            </ChatSidebarItemStatus>
            <ChatSidebarItemCount>4</ChatSidebarItemCount>
            <ChatSidebarItemMetaIcon role="img" aria-label="Draft">
              <Pencil aria-hidden />
            </ChatSidebarItemMetaIcon>
          </ChatSidebarItemAside>
        </ChatSidebarItem>
      </StateGroup>
    </div>
  );
}

// @docs-source-strip-start
// Canvas-only legend so the reader can tell which state each row demonstrates.
function StateLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 mb-1 font-mono text-[10px] leading-none text-foreground-placeholder">
      {children}
    </p>
  );
}
// @docs-source-strip-end

function StateGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0">
      <h2 className="mb-2 text-xs font-medium text-foreground-muted">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
