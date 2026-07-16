import { AtSign, BellOff, Bookmark, GitBranch, Hash, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, Status } from "raft-ui";
import {
  ChatSidebarActivitySlot,
  ChatSidebarContent,
  ChatSidebarItemAside,
  ChatSidebarItemCount,
  ChatSidebarBody,
  ChatSidebarHeader,
  ChatSidebarHeaderTitle,
  ChatSidebarItem,
  ChatSidebarItemIcon,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemIndicator,
  ChatSidebarItemMetaIcon,
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
  ChatSidebarRoot,
  ChatSidebarAction,
  ChatSidebarSection,
  ChatSidebarSectionActions,
  ChatSidebarSectionAttention,
  ChatSidebarSectionButton,
  ChatSidebarSectionChevron,
  ChatSidebarSectionHeader,
  ChatSidebarSectionTitle,
  ChatSidebarSectionTrailing,
} from "raft-ui/wip";

import {
  SidebarSectionAddButton,
  SidebarSectionChannelsMenu,
  SidebarSectionHeaderMenu,
  SidebarSectionSortMenu,
} from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";
import { LiveAgentActivityBarComposition } from "#/modules/live-agent-activity-bar/live-agent-activity-bar.composition.tsx";

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
    <ChatSidebarRoot className="overflow-x-clip">
      <ChatSidebarHeader>
        <div className="min-w-0 flex-1">
          <ChatSidebarHeaderTitle>Chat</ChatSidebarHeaderTitle>
        </div>
        <span className="sr-only" aria-live="polite">
          <span key={announcement.sequence}>{announcement.message}</span>
        </span>
        <ChatSidebarAction type="button" aria-label="Add channel" disabled>
          <Plus />
        </ChatSidebarAction>
      </ChatSidebarHeader>
      <ChatSidebarBody>
        <ChatSidebarContent className="min-h-0">
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

            <ChatSidebarSection>
              <SidebarSectionHeaderMenu menu="sort">
                <ChatSidebarSectionButton type="button">
                  <ChatSidebarSectionTitle>Pinned</ChatSidebarSectionTitle>
                  <ChatSidebarSectionChevron />
                </ChatSidebarSectionButton>
                <ChatSidebarSectionTrailing>
                  <ChatSidebarSectionActions>
                    <SidebarSectionSortMenu aria-label="Sort pinned" />
                  </ChatSidebarSectionActions>
                </ChatSidebarSectionTrailing>
              </SidebarSectionHeaderMenu>
              <ChatSidebarList>
                <ChatSidebarItem
                  type="button"
                  active={selectedItem === "#proj-uiux"}
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
                  active={selectedItem === "Atlas planning"}
                  onClick={() => openDestination("Atlas planning")}
                >
                  <ChatSidebarItemIcon>
                    <Avatar size="2xs" type="agent">
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
                  active={selectedItem === "#proj-theme"}
                  onClick={() => openDestination("#proj-theme")}
                >
                  <ChatSidebarItemChannelIcon aria-hidden>
                    <Hash />
                  </ChatSidebarItemChannelIcon>
                  <ChatSidebarItemText>
                    <ChatSidebarItemTitle>#proj-theme</ChatSidebarItemTitle>
                  </ChatSidebarItemText>
                  <ChatSidebarItemAside>
                    <ChatSidebarItemMetaIcon role="img" aria-label="Draft">
                      <Pencil aria-hidden />
                    </ChatSidebarItemMetaIcon>
                  </ChatSidebarItemAside>
                </ChatSidebarItem>
              </ChatSidebarList>
            </ChatSidebarSection>

            <ChatSidebarSection defaultOpen={false}>
              <SidebarSectionHeaderMenu
                menu="channels"
                count={1}
                countLabel="channels"
                createLabel="Create Joint Channel"
                createIcon="joint"
                createDisabled
              >
                <ChatSidebarSectionButton type="button">
                  <ChatSidebarSectionTitle>Joint Channels</ChatSidebarSectionTitle>
                  <ChatSidebarSectionChevron />
                </ChatSidebarSectionButton>
                <ChatSidebarSectionTrailing>
                  <ChatSidebarSectionAttention />
                  <ChatSidebarSectionActions>
                    <SidebarSectionAddButton aria-label="Create joint channel" disabled />
                    <SidebarSectionChannelsMenu
                      aria-label="Joint channels menu"
                      count={1}
                      countLabel="channels"
                      createLabel="Create Joint Channel"
                      createIcon="joint"
                      createDisabled
                    />
                  </ChatSidebarSectionActions>
                </ChatSidebarSectionTrailing>
              </SidebarSectionHeaderMenu>
              <ChatSidebarList>
                <ChatSidebarItem
                  type="button"
                  active={selectedItem === "#partners"}
                  onClick={() => openDestination("#partners")}
                >
                  <ChatSidebarItemChannelIcon aria-hidden>
                    <GitBranch />
                  </ChatSidebarItemChannelIcon>
                  <ChatSidebarItemText>
                    <ChatSidebarItemTitle>#partners</ChatSidebarItemTitle>
                  </ChatSidebarItemText>
                  <ChatSidebarItemCount>3</ChatSidebarItemCount>
                </ChatSidebarItem>
              </ChatSidebarList>
            </ChatSidebarSection>

            <ChatSidebarSection>
              <SidebarSectionHeaderMenu
                menu="channels"
                count={2}
                countLabel="channels"
                createLabel="Create Channel"
                createIcon="channel"
                createDisabled
              >
                <ChatSidebarSectionButton type="button">
                  <ChatSidebarSectionTitle>Channels</ChatSidebarSectionTitle>
                  <ChatSidebarSectionChevron />
                </ChatSidebarSectionButton>
                <ChatSidebarSectionTrailing>
                  <ChatSidebarSectionActions>
                    <SidebarSectionAddButton aria-label="Create channel" disabled />
                    <SidebarSectionChannelsMenu
                      aria-label="Channels menu"
                      count={2}
                      countLabel="channels"
                      createLabel="Create Channel"
                      createIcon="channel"
                      createDisabled
                    />
                  </ChatSidebarSectionActions>
                </ChatSidebarSectionTrailing>
              </SidebarSectionHeaderMenu>
              <ChatSidebarList>
                <ChatSidebarItem
                  type="button"
                  active={selectedItem === "#general"}
                  onClick={() => openDestination("#general")}
                >
                  <ChatSidebarItemChannelIcon aria-hidden>
                    <Hash />
                  </ChatSidebarItemChannelIcon>
                  <ChatSidebarItemText>
                    <ChatSidebarItemTitle>#general</ChatSidebarItemTitle>
                  </ChatSidebarItemText>
                  <ChatSidebarItemAside>
                    <ChatSidebarItemIndicator role="img" aria-label="Mentioned you">
                      <AtSign aria-hidden />
                    </ChatSidebarItemIndicator>
                    <ChatSidebarItemCount>12</ChatSidebarItemCount>
                  </ChatSidebarItemAside>
                </ChatSidebarItem>
                <ChatSidebarItem
                  type="button"
                  active={selectedItem === "#release"}
                  onClick={() => openDestination("#release")}
                >
                  <ChatSidebarItemChannelIcon aria-hidden>
                    <Hash />
                  </ChatSidebarItemChannelIcon>
                  <ChatSidebarItemInlineText align="center">
                    <ChatSidebarItemTitle>#release</ChatSidebarItemTitle>
                    <ChatSidebarItemMetaIcon
                      role="img"
                      aria-label="Activity muted"
                      title="Activity muted. Direct mentions can still notify you."
                    >
                      <BellOff aria-hidden />
                    </ChatSidebarItemMetaIcon>
                  </ChatSidebarItemInlineText>
                  <ChatSidebarItemAside>
                    <ChatSidebarItemMetaIcon role="img" aria-label="Draft">
                      <Pencil aria-hidden />
                    </ChatSidebarItemMetaIcon>
                  </ChatSidebarItemAside>
                </ChatSidebarItem>
              </ChatSidebarList>
            </ChatSidebarSection>

            <ChatSidebarSection>
              <SidebarSectionHeaderMenu menu="sort">
                <ChatSidebarSectionButton type="button">
                  <ChatSidebarSectionTitle>Direct Messages</ChatSidebarSectionTitle>
                  <ChatSidebarSectionChevron />
                </ChatSidebarSectionButton>
                <ChatSidebarSectionTrailing>
                  <ChatSidebarSectionActions>
                    <SidebarSectionSortMenu aria-label="Sort direct messages" />
                  </ChatSidebarSectionActions>
                </ChatSidebarSectionTrailing>
              </SidebarSectionHeaderMenu>
              <ChatSidebarList>
                <ChatSidebarItem
                  type="button"
                  active={selectedItem === "Cindy"}
                  onClick={() => openDestination("Cindy")}
                >
                  <ChatSidebarItemIcon>
                    <Avatar size="2xs" type="human">
                      <AvatarFallback className="text-[9px] font-bold">C</AvatarFallback>
                    </Avatar>
                  </ChatSidebarItemIcon>
                  <ChatSidebarItemInlineText titleWidth="constrained">
                    <ChatSidebarItemTitle>Cindy</ChatSidebarItemTitle>
                    <ChatSidebarItemSubtitle>design</ChatSidebarItemSubtitle>
                  </ChatSidebarItemInlineText>
                  <ChatSidebarItemAside>
                    <Status aria-hidden variant="success" size="md" />
                    <ChatSidebarItemCount>4</ChatSidebarItemCount>
                  </ChatSidebarItemAside>
                </ChatSidebarItem>
                <ChatSidebarItem
                  type="button"
                  active={selectedItem === "Atlas idle"}
                  onClick={() => openDestination("Atlas idle")}
                >
                  <ChatSidebarItemIcon>
                    <Avatar size="2xs" type="agent" />
                  </ChatSidebarItemIcon>
                  <ChatSidebarItemInlineText titleWidth="constrained">
                    <ChatSidebarItemTitle>Atlas</ChatSidebarItemTitle>
                    <ChatSidebarItemSubtitle>idle</ChatSidebarItemSubtitle>
                  </ChatSidebarItemInlineText>
                  <ChatSidebarItemAside>
                    <ChatSidebarItemMetaIcon role="img" aria-label="Draft">
                      <Pencil aria-hidden />
                    </ChatSidebarItemMetaIcon>
                  </ChatSidebarItemAside>
                </ChatSidebarItem>
              </ChatSidebarList>
            </ChatSidebarSection>
          </div>
        </ChatSidebarContent>
      </ChatSidebarBody>
      <ChatSidebarActivitySlot>
        <LiveAgentActivityBarComposition
          latest={{ text: "Preparing the next release candidate" }}
        />
      </ChatSidebarActivitySlot>
    </ChatSidebarRoot>
  );
}
