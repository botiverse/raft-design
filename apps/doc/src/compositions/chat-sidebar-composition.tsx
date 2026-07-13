import { AtSign, BellOff, Bookmark, GitBranch, Hash, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, Status } from "raft-ui";
import {
  AppShellMain,
  AppShellSidebar,
  AppShellRoot,
  ChatSidebarContent,
  ChatSidebarItemAside,
  ChatSidebarItemBadge,
  ChatSidebarBody,
  ChatSidebarHeader,
  ChatSidebarHeaderTitle,
  ChatSidebarItem,
  ChatSidebarItemUnread,
  ChatSidebarItemIcon,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemDraft,
  ChatSidebarItemMention,
  ChatSidebarItemMuted,
  ChatSidebarItemInlineText,
  ChatSidebarItemSubtitle,
  ChatSidebarItemText,
  ChatSidebarItemTitle,
  ChatSidebarList,
  ChatSidebarMenu,
  ChatSidebarMenuAside,
  ChatSidebarMenuCount,
  ChatSidebarMenuIcon,
  ChatSidebarMenuTitle,
  ChatSidebarResizeGroup,
  ChatSidebarResizeHandle,
  ChatSidebarResizePanel,
  ChatSidebarRoot,
  ChatSidebarAction,
  ChatSidebarSection,
  ChatSidebarSectionAttention,
  ChatSidebarSectionButton,
  ChatSidebarSectionChevron,
  ChatSidebarSectionCount,
  ChatSidebarSectionHeader,
  ChatSidebarSectionTitle,
} from "raft-ui/wip";

import { AppRailComposition } from "./chat-rail-composition.tsx";
import { ChatMainPanelComposition } from "./chat-main-panel-composition.tsx";

export function ChatSidebarPreviewComposition() {
  return (
    <AppShellRoot className="h-full min-w-[865px] border border-line-strong shadow-sm">
      <AppRailComposition />
      <ChatSidebarResizeGroup className="min-w-0 flex-1" orientation="horizontal">
        <ChatSidebarResizePanel
          id="chat-sidebar"
          defaultSize={308}
          minSize={180}
          maxSize={368}
          groupResizeBehavior="preserve-pixel-size"
        >
          <AppShellSidebar resizable className="h-full">
            <ChatSidebarComposition />
          </AppShellSidebar>
        </ChatSidebarResizePanel>
        <ChatSidebarResizeHandle />
        <ChatSidebarResizePanel id="chat-main-panel" minSize={0} className="min-w-0">
          <AppShellMain className="flex h-full">
            <ChatMainPanelComposition />
          </AppShellMain>
        </ChatSidebarResizePanel>
      </ChatSidebarResizeGroup>
    </AppShellRoot>
  );
}

export function ChatSidebarComposition() {
  const [selectedItem, setSelectedItem] = useState("#proj-uiux");
  const [announcement, setAnnouncement] = useState({ message: "Opened #proj-uiux", sequence: 0 });

  function announce(message: string) {
    setAnnouncement((current) => ({ message, sequence: current.sequence + 1 }));
  }

  function openDestination(destination: string) {
    setSelectedItem(destination);
    announce(`Opened ${destination}`);
  }

  return (
    <ChatSidebarRoot>
      <ChatSidebarHeader>
        <div className="min-w-0 flex-1">
          <ChatSidebarHeaderTitle>Chat</ChatSidebarHeaderTitle>
        </div>
        <span className="sr-only" aria-live="polite">
          <span key={announcement.sequence}>{announcement.message}</span>
        </span>
        <ChatSidebarAction
          type="button"
          aria-label="Add channel"
          onClick={() => announce("Channel creation requested")}
        >
          <Plus className="size-3.5" />
        </ChatSidebarAction>
      </ChatSidebarHeader>
      <ChatSidebarBody>
        <ChatSidebarContent className="min-h-0 px-2">
          <div className="min-h-full">
            <ChatSidebarSection>
              <ChatSidebarSectionHeader className="mt-0">
                <ChatSidebarMenu
                  aria-current={selectedItem === "Saved" ? "page" : undefined}
                  onClick={() => openDestination("Saved")}
                >
                  <ChatSidebarMenuIcon>
                    <Bookmark />
                  </ChatSidebarMenuIcon>
                  <ChatSidebarMenuTitle>Saved</ChatSidebarMenuTitle>
                  <ChatSidebarMenuAside>
                    <ChatSidebarMenuCount>2</ChatSidebarMenuCount>
                  </ChatSidebarMenuAside>
                </ChatSidebarMenu>
              </ChatSidebarSectionHeader>
            </ChatSidebarSection>

            <ChatSidebarSection className="px-0">
              <ChatSidebarSectionHeader>
                <ChatSidebarSectionButton type="button">
                  <ChatSidebarSectionChevron className="size-3" />
                  <ChatSidebarSectionTitle>Pinned</ChatSidebarSectionTitle>
                  <ChatSidebarSectionCount>3</ChatSidebarSectionCount>
                </ChatSidebarSectionButton>
              </ChatSidebarSectionHeader>
              <ChatSidebarList>
                <ChatSidebarItem
                  type="button"
                  aria-current={selectedItem === "#proj-uiux" ? "page" : undefined}
                  onClick={() => openDestination("#proj-uiux")}
                >
                  <ChatSidebarItemChannelIcon aria-hidden>
                    <Hash />
                  </ChatSidebarItemChannelIcon>
                  <ChatSidebarItemText>
                    <ChatSidebarItemTitle className="shrink-0">#proj-uiux</ChatSidebarItemTitle>
                    <ChatSidebarItemSubtitle>Cindy replied</ChatSidebarItemSubtitle>
                  </ChatSidebarItemText>
                </ChatSidebarItem>
                <ChatSidebarItem
                  type="button"
                  aria-current={selectedItem === "Atlas planning" ? "page" : undefined}
                  onClick={() => openDestination("Atlas planning")}
                >
                  <ChatSidebarItemIcon>
                    <Avatar size="sidebar" type="agent">
                      <AvatarFallback className="text-[9px] font-bold">A</AvatarFallback>
                    </Avatar>
                  </ChatSidebarItemIcon>
                  <ChatSidebarItemInlineText titleWidth="constrained">
                    <ChatSidebarItemTitle>Atlas</ChatSidebarItemTitle>
                    <ChatSidebarItemSubtitle>planning</ChatSidebarItemSubtitle>
                  </ChatSidebarItemInlineText>
                  <ChatSidebarItemAside>
                    <Status aria-hidden variant="success" size="md" />
                  </ChatSidebarItemAside>
                </ChatSidebarItem>
                <ChatSidebarItem
                  type="button"
                  aria-current={selectedItem === "#proj-theme" ? "page" : undefined}
                  onClick={() => openDestination("#proj-theme")}
                >
                  <ChatSidebarItemChannelIcon aria-hidden>
                    <Hash />
                  </ChatSidebarItemChannelIcon>
                  <ChatSidebarItemText>
                    <ChatSidebarItemTitle>#proj-theme</ChatSidebarItemTitle>
                  </ChatSidebarItemText>
                  <ChatSidebarItemAside>
                    <ChatSidebarItemDraft aria-label="Draft">
                      <Pencil aria-hidden />
                    </ChatSidebarItemDraft>
                  </ChatSidebarItemAside>
                </ChatSidebarItem>
              </ChatSidebarList>
            </ChatSidebarSection>

            <ChatSidebarSection defaultOpen={false} className="px-0">
              <ChatSidebarSectionHeader>
                <ChatSidebarSectionButton type="button">
                  <ChatSidebarSectionChevron className="size-3" />
                  <ChatSidebarSectionTitle>Joint Channels</ChatSidebarSectionTitle>
                  <ChatSidebarSectionCount>1</ChatSidebarSectionCount>
                  <ChatSidebarSectionAttention />
                </ChatSidebarSectionButton>
              </ChatSidebarSectionHeader>
              <ChatSidebarList>
                <ChatSidebarItem
                  type="button"
                  aria-current={selectedItem === "#partners" ? "page" : undefined}
                  onClick={() => openDestination("#partners")}
                >
                  <ChatSidebarItemChannelIcon aria-hidden>
                    <GitBranch />
                  </ChatSidebarItemChannelIcon>
                  <ChatSidebarItemText>
                    <ChatSidebarItemTitle>#partners</ChatSidebarItemTitle>
                  </ChatSidebarItemText>
                  <ChatSidebarItemBadge>3</ChatSidebarItemBadge>
                </ChatSidebarItem>
              </ChatSidebarList>
            </ChatSidebarSection>

            <ChatSidebarSection className="px-0">
              <ChatSidebarSectionHeader>
                <ChatSidebarSectionButton type="button">
                  <ChatSidebarSectionChevron className="size-3" />
                  <ChatSidebarSectionTitle>Channels</ChatSidebarSectionTitle>
                  <ChatSidebarSectionCount>2</ChatSidebarSectionCount>
                </ChatSidebarSectionButton>
              </ChatSidebarSectionHeader>
              <ChatSidebarList>
                <ChatSidebarItemUnread
                  type="button"
                  aria-current={selectedItem === "#general" ? "page" : undefined}
                  onClick={() => openDestination("#general")}
                >
                  <ChatSidebarItemChannelIcon aria-hidden>
                    <Hash />
                  </ChatSidebarItemChannelIcon>
                  <ChatSidebarItemText>
                    <ChatSidebarItemTitle>#general</ChatSidebarItemTitle>
                  </ChatSidebarItemText>
                  <ChatSidebarItemAside>
                    <ChatSidebarItemMention aria-label="Mentioned you">
                      <AtSign aria-hidden />
                    </ChatSidebarItemMention>
                    <ChatSidebarItemBadge>12</ChatSidebarItemBadge>
                  </ChatSidebarItemAside>
                </ChatSidebarItemUnread>
                <ChatSidebarItem
                  type="button"
                  aria-current={selectedItem === "#release" ? "page" : undefined}
                  onClick={() => openDestination("#release")}
                >
                  <ChatSidebarItemChannelIcon aria-hidden>
                    <Hash />
                  </ChatSidebarItemChannelIcon>
                  <ChatSidebarItemInlineText align="center">
                    <ChatSidebarItemTitle>#release</ChatSidebarItemTitle>
                    <ChatSidebarItemMuted
                      aria-label="Activity muted"
                      title="Activity muted. Direct mentions can still notify you."
                    >
                      <BellOff aria-hidden />
                    </ChatSidebarItemMuted>
                  </ChatSidebarItemInlineText>
                  <ChatSidebarItemAside>
                    <ChatSidebarItemDraft aria-label="Draft">
                      <Pencil aria-hidden />
                    </ChatSidebarItemDraft>
                  </ChatSidebarItemAside>
                </ChatSidebarItem>
              </ChatSidebarList>
            </ChatSidebarSection>

            <ChatSidebarSection className="px-0">
              <ChatSidebarSectionHeader>
                <ChatSidebarSectionButton type="button">
                  <ChatSidebarSectionChevron className="size-3" />
                  <ChatSidebarSectionTitle>Direct Messages</ChatSidebarSectionTitle>
                  <ChatSidebarSectionCount>2</ChatSidebarSectionCount>
                </ChatSidebarSectionButton>
              </ChatSidebarSectionHeader>
              <ChatSidebarList>
                <ChatSidebarItemUnread
                  type="button"
                  aria-current={selectedItem === "Cindy" ? "page" : undefined}
                  onClick={() => openDestination("Cindy")}
                >
                  <ChatSidebarItemIcon>
                    <Avatar size="sidebar" type="human">
                      <AvatarFallback className="text-[9px] font-bold">C</AvatarFallback>
                    </Avatar>
                  </ChatSidebarItemIcon>
                  <ChatSidebarItemInlineText titleWidth="constrained">
                    <ChatSidebarItemTitle>Cindy</ChatSidebarItemTitle>
                    <ChatSidebarItemSubtitle>design</ChatSidebarItemSubtitle>
                  </ChatSidebarItemInlineText>
                  <ChatSidebarItemAside>
                    <Status aria-hidden variant="success" size="md" />
                    <ChatSidebarItemBadge>4</ChatSidebarItemBadge>
                  </ChatSidebarItemAside>
                </ChatSidebarItemUnread>
                <ChatSidebarItem
                  type="button"
                  aria-current={selectedItem === "Atlas idle" ? "page" : undefined}
                  onClick={() => openDestination("Atlas idle")}
                >
                  <ChatSidebarItemIcon>
                    <Avatar size="sidebar" type="agent" />
                  </ChatSidebarItemIcon>
                  <ChatSidebarItemInlineText titleWidth="constrained">
                    <ChatSidebarItemTitle>Atlas</ChatSidebarItemTitle>
                    <ChatSidebarItemSubtitle>idle</ChatSidebarItemSubtitle>
                  </ChatSidebarItemInlineText>
                  <ChatSidebarItemAside>
                    <ChatSidebarItemDraft aria-label="Draft">
                      <Pencil aria-hidden />
                    </ChatSidebarItemDraft>
                  </ChatSidebarItemAside>
                </ChatSidebarItem>
              </ChatSidebarList>
            </ChatSidebarSection>
          </div>
        </ChatSidebarContent>
      </ChatSidebarBody>
    </ChatSidebarRoot>
  );
}
