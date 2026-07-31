import { AtSign, BellOff, Hash, Pencil } from "lucide-react";
import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  Status,
  SidebarItem,
  SidebarItemAside,
  SidebarItemCount,
  SidebarItemChannelIcon,
  SidebarItemIcon,
  SidebarItemIndicator,
  SidebarItemMeta,
  SidebarItemMetaIcon,
  SidebarItemStatus,
  SidebarItemSubtitle,
  SidebarItemContent,
  SidebarItemTitle,
} from "raft-ui";

export function SidebarItemStatesComposition() {
  const [currentItem, setCurrentItem] = useState("selected");

  return (
    <div className="grid w-full max-w-2xl gap-y-6 md:grid-cols-2 md:gap-x-[36px]">
      <StateGroup title="Channel rows">
        {/* @docs-source-strip-start */}
        <StateLabel>Selected channel</StateLabel>
        {/* @docs-source-strip-end */}
        <SidebarItem active={currentItem === "selected"} onClick={() => setCurrentItem("selected")}>
          <SidebarItemChannelIcon aria-hidden>
            <Hash />
          </SidebarItemChannelIcon>
          <SidebarItemContent>
            <SidebarItemTitle>proj-uiux</SidebarItemTitle>
            <SidebarItemSubtitle>Cindy replied</SidebarItemSubtitle>
          </SidebarItemContent>
        </SidebarItem>

        {/* @docs-source-strip-start */}
        <StateLabel>Channel with timestamp</StateLabel>
        {/* @docs-source-strip-end */}
        <SidebarItem active={currentItem === "channel"} onClick={() => setCurrentItem("channel")}>
          <SidebarItemChannelIcon aria-hidden>
            <Hash />
          </SidebarItemChannelIcon>
          <SidebarItemContent>
            <SidebarItemTitle>general</SidebarItemTitle>
            <SidebarItemSubtitle>Ken shared a spec</SidebarItemSubtitle>
            <SidebarItemMeta>2h</SidebarItemMeta>
          </SidebarItemContent>
        </SidebarItem>

        {/* @docs-source-strip-start */}
        <StateLabel>Menu open</StateLabel>
        {/* @docs-source-strip-end */}
        <SidebarItem
          data-popup-open
          active={currentItem === "popup"}
          onClick={() => setCurrentItem("popup")}
        >
          <SidebarItemChannelIcon aria-hidden>
            <Hash />
          </SidebarItemChannelIcon>
          <SidebarItemContent>
            <SidebarItemTitle>community</SidebarItemTitle>
            <SidebarItemSubtitle>New pinned message</SidebarItemSubtitle>
          </SidebarItemContent>
        </SidebarItem>

        {/* @docs-source-strip-start */}
        <StateLabel>Unread count and draft</StateLabel>
        {/* @docs-source-strip-end */}
        <SidebarItem active={currentItem === "unread"} onClick={() => setCurrentItem("unread")}>
          <SidebarItemChannelIcon aria-hidden>
            <Hash />
          </SidebarItemChannelIcon>
          <SidebarItemContent>
            <SidebarItemTitle>release</SidebarItemTitle>
            <SidebarItemSubtitle>Build 4.2 shipped</SidebarItemSubtitle>
          </SidebarItemContent>
          <SidebarItemAside>
            <SidebarItemCount>3</SidebarItemCount>
            <SidebarItemMetaIcon role="img" aria-label="Draft">
              <Pencil aria-hidden />
            </SidebarItemMetaIcon>
          </SidebarItemAside>
        </SidebarItem>

        {/* @docs-source-strip-start */}
        <StateLabel>Mention, unread count, and muted</StateLabel>
        {/* @docs-source-strip-end */}
        <SidebarItem active={currentItem === "mention"} onClick={() => setCurrentItem("mention")}>
          <SidebarItemChannelIcon aria-hidden>
            <Hash />
          </SidebarItemChannelIcon>
          <SidebarItemContent>
            <SidebarItemTitle>design</SidebarItemTitle>
            <SidebarItemSubtitle>Mentioned you</SidebarItemSubtitle>
          </SidebarItemContent>
          <SidebarItemAside>
            <SidebarItemIndicator role="img" aria-label="Mentioned you">
              <AtSign aria-hidden />
            </SidebarItemIndicator>
            <SidebarItemCount>12</SidebarItemCount>
            <SidebarItemMetaIcon role="img" aria-label="Activity muted">
              <BellOff aria-hidden />
            </SidebarItemMetaIcon>
          </SidebarItemAside>
        </SidebarItem>
      </StateGroup>

      <StateGroup title="Metadata and direct messages">
        {/* @docs-source-strip-start */}
        <StateLabel>Draft</StateLabel>
        {/* @docs-source-strip-end */}
        <SidebarItem active={currentItem === "draft"} onClick={() => setCurrentItem("draft")}>
          <SidebarItemChannelIcon aria-hidden>
            <Hash />
          </SidebarItemChannelIcon>
          <SidebarItemContent>
            <SidebarItemTitle>planning</SidebarItemTitle>
            <SidebarItemSubtitle>Draft</SidebarItemSubtitle>
          </SidebarItemContent>
          <SidebarItemAside>
            <SidebarItemMetaIcon role="img" aria-label="Draft">
              <Pencil aria-hidden />
            </SidebarItemMetaIcon>
          </SidebarItemAside>
        </SidebarItem>

        {/* @docs-source-strip-start */}
        <StateLabel>Muted</StateLabel>
        {/* @docs-source-strip-end */}
        <SidebarItem active={currentItem === "muted"} onClick={() => setCurrentItem("muted")}>
          <SidebarItemChannelIcon aria-hidden>
            <Hash />
          </SidebarItemChannelIcon>
          <SidebarItemContent>
            <SidebarItemTitle>announcements</SidebarItemTitle>
            <SidebarItemSubtitle>Muted</SidebarItemSubtitle>
          </SidebarItemContent>
          <SidebarItemAside>
            <SidebarItemMetaIcon role="img" aria-label="Activity muted">
              <BellOff aria-hidden />
            </SidebarItemMetaIcon>
          </SidebarItemAside>
        </SidebarItem>

        {/* @docs-source-strip-start */}
        <StateLabel>Agent activity</StateLabel>
        {/* @docs-source-strip-end */}
        <SidebarItem active={currentItem === "agent"} onClick={() => setCurrentItem("agent")}>
          <SidebarItemIcon>
            <Avatar size="2xs" type="agent">
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
          </SidebarItemIcon>
          <SidebarItemContent>
            <SidebarItemTitle>Atlas</SidebarItemTitle>
            <SidebarItemSubtitle>Working on release notes</SidebarItemSubtitle>
          </SidebarItemContent>
          <SidebarItemAside>
            <SidebarItemStatus>
              <Status aria-label="Working" variant="primary" />
            </SidebarItemStatus>
            <SidebarItemCount>2</SidebarItemCount>
          </SidebarItemAside>
        </SidebarItem>

        {/* @docs-source-strip-start */}
        <StateLabel>Direct message</StateLabel>
        {/* @docs-source-strip-end */}
        <SidebarItem active={currentItem === "dm"} onClick={() => setCurrentItem("dm")}>
          <SidebarItemIcon>
            <Avatar size="2xs" type="human">
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
          </SidebarItemIcon>
          <SidebarItemContent>
            <SidebarItemTitle>Cindy</SidebarItemTitle>
            <SidebarItemSubtitle>Sent you a file</SidebarItemSubtitle>
          </SidebarItemContent>
          <SidebarItemAside>
            <SidebarItemStatus>
              <Status aria-label="Online" variant="success" />
            </SidebarItemStatus>
            <SidebarItemCount>4</SidebarItemCount>
            <SidebarItemMetaIcon role="img" aria-label="Draft">
              <Pencil aria-hidden />
            </SidebarItemMetaIcon>
          </SidebarItemAside>
        </SidebarItem>
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
