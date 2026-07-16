import { AtSign, BellOff, Bookmark, Hash, Pencil } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, Status } from "raft-ui";
import {
  ChatSidebarLiveActivity,
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
  ChatSidebarItemContent,
  ChatSidebarItemStatus,
  ChatSidebarItemSubtitle,
  ChatSidebarItemTitle,
  ChatSidebarList,
  ChatSidebarMenu,
  ChatSidebarMenuAside,
  ChatSidebarMenuCount,
  ChatSidebarMenuIcon,
  ChatSidebarMenuTitle,
  ChatSidebarRoot,
  ChatSidebarSection,
  ChatSidebarSectionEmpty,
  ChatSidebarSectionControls,
  ChatSidebarSectionAttention,
  ChatSidebarSectionDisclosure,
  ChatSidebarSectionChevron,
  ChatSidebarSectionHeader,
  ChatSidebarSectionTitle,
  ChatSidebarSectionTrailing,
} from "raft-ui";

import {
  SidebarSectionAddButton,
  SidebarSectionChannelsMenu,
  SidebarCreateMenu,
  SidebarSectionHeaderMenu,
  SidebarSectionSortMenu,
} from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";
import {
  LiveAgentActivityBarComposition,
  type LiveAgentActivityBarItem,
} from "#/modules/live-agent-activity-bar/live-agent-activity-bar.composition.tsx";

export type ChatSidebarContentState = "populated" | "empty";
export type ChatSidebarLiveActivityState = "none" | "active";

export type ChatSidebarCompositionProps = {
  contentState?: ChatSidebarContentState;
  liveActivityState?: ChatSidebarLiveActivityState;
};

const LIVE_ACTIVITY: Record<ChatSidebarLiveActivityState, LiveAgentActivityBarItem | null> = {
  none: null,
  active: { text: "Preparing the next release candidate" },
};

export function ChatSidebarComposition({
  contentState = "populated",
  liveActivityState = "active",
}: ChatSidebarCompositionProps) {
  const [selectedItem, setSelectedItem] = useState("proj-uiux");
  const [announcement, setAnnouncement] = useState({ message: "Opened proj-uiux", sequence: 0 });
  const isEmpty = contentState === "empty";

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
        <SidebarCreateMenu
          onCreateChannel={() => announce("Create Channel")}
          onCreateJoint={() => announce("Create Joint Channel")}
        />
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
                <ChatSidebarSectionDisclosure type="button">
                  <ChatSidebarSectionTitle>Pinned</ChatSidebarSectionTitle>
                  <ChatSidebarSectionChevron />
                </ChatSidebarSectionDisclosure>
                <ChatSidebarSectionTrailing>
                  <ChatSidebarSectionControls>
                    <SidebarSectionSortMenu aria-label="Sort pinned" />
                  </ChatSidebarSectionControls>
                </ChatSidebarSectionTrailing>
              </SidebarSectionHeaderMenu>
              {isEmpty ? (
                <ChatSidebarSectionEmpty>No pinned conversations yet</ChatSidebarSectionEmpty>
              ) : (
                <ChatSidebarList>
                  <ChatSidebarItem
                    type="button"
                    active={selectedItem === "proj-uiux"}
                    onClick={() => openDestination("proj-uiux")}
                  >
                    <ChatSidebarItemChannelIcon aria-hidden>
                      <Hash />
                    </ChatSidebarItemChannelIcon>
                    <ChatSidebarItemContent>
                      <ChatSidebarItemTitle className="shrink-0">proj-uiux</ChatSidebarItemTitle>
                      <ChatSidebarItemSubtitle>Cindy replied</ChatSidebarItemSubtitle>
                    </ChatSidebarItemContent>
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
                    <ChatSidebarItemContent>
                      <ChatSidebarItemTitle>Atlas</ChatSidebarItemTitle>
                      <ChatSidebarItemSubtitle>planning</ChatSidebarItemSubtitle>
                    </ChatSidebarItemContent>
                    <ChatSidebarItemAside>
                      <ChatSidebarItemStatus>
                        <Status aria-hidden variant="success" size="md" />
                      </ChatSidebarItemStatus>
                    </ChatSidebarItemAside>
                  </ChatSidebarItem>
                  <ChatSidebarItem
                    type="button"
                    active={selectedItem === "proj-theme"}
                    onClick={() => openDestination("proj-theme")}
                  >
                    <ChatSidebarItemChannelIcon aria-hidden>
                      <Hash />
                    </ChatSidebarItemChannelIcon>
                    <ChatSidebarItemContent>
                      <ChatSidebarItemTitle>proj-theme</ChatSidebarItemTitle>
                    </ChatSidebarItemContent>
                    <ChatSidebarItemAside>
                      <ChatSidebarItemMetaIcon role="img" aria-label="Draft">
                        <Pencil aria-hidden />
                      </ChatSidebarItemMetaIcon>
                    </ChatSidebarItemAside>
                  </ChatSidebarItem>
                </ChatSidebarList>
              )}
            </ChatSidebarSection>

            <ChatSidebarSection>
              <SidebarSectionHeaderMenu
                menu="channels"
                count={0}
                countLabel="channels"
                createLabel="Create Joint Channel"
                createIcon="joint"
                createDisabled
              >
                <ChatSidebarSectionDisclosure type="button">
                  <ChatSidebarSectionTitle>Joint Channels</ChatSidebarSectionTitle>
                  <ChatSidebarSectionChevron />
                </ChatSidebarSectionDisclosure>
                <ChatSidebarSectionTrailing>
                  <ChatSidebarSectionAttention />
                  <ChatSidebarSectionControls>
                    <SidebarSectionAddButton aria-label="Create joint channel" disabled />
                    <SidebarSectionChannelsMenu
                      aria-label="Joint channels menu"
                      count={1}
                      countLabel="channels"
                      createLabel="Create Joint Channel"
                      createIcon="joint"
                      createDisabled
                    />
                  </ChatSidebarSectionControls>
                </ChatSidebarSectionTrailing>
              </SidebarSectionHeaderMenu>
              <ChatSidebarSectionEmpty>No joint channels yet</ChatSidebarSectionEmpty>
            </ChatSidebarSection>

            <ChatSidebarSection>
              <SidebarSectionHeaderMenu
                menu="channels"
                count={isEmpty ? 0 : 2}
                countLabel="channels"
                createLabel="Create Channel"
                createIcon="channel"
                createDisabled
              >
                <ChatSidebarSectionDisclosure type="button">
                  <ChatSidebarSectionTitle>Channels</ChatSidebarSectionTitle>
                  <ChatSidebarSectionChevron />
                </ChatSidebarSectionDisclosure>
                <ChatSidebarSectionTrailing>
                  <ChatSidebarSectionControls>
                    <SidebarSectionAddButton aria-label="Create channel" disabled />
                    <SidebarSectionChannelsMenu
                      aria-label="Channels menu"
                      count={isEmpty ? 0 : 2}
                      countLabel="channels"
                      createLabel="Create Channel"
                      createIcon="channel"
                      createDisabled
                    />
                  </ChatSidebarSectionControls>
                </ChatSidebarSectionTrailing>
              </SidebarSectionHeaderMenu>
              {isEmpty ? (
                <ChatSidebarSectionEmpty>No channels yet</ChatSidebarSectionEmpty>
              ) : (
                <ChatSidebarList>
                  <ChatSidebarItem
                    type="button"
                    active={selectedItem === "general"}
                    onClick={() => openDestination("general")}
                  >
                    <ChatSidebarItemChannelIcon aria-hidden>
                      <Hash />
                    </ChatSidebarItemChannelIcon>
                    <ChatSidebarItemContent>
                      <ChatSidebarItemTitle>general</ChatSidebarItemTitle>
                    </ChatSidebarItemContent>
                    <ChatSidebarItemAside>
                      <ChatSidebarItemIndicator role="img" aria-label="Mentioned you">
                        <AtSign aria-hidden />
                      </ChatSidebarItemIndicator>
                      <ChatSidebarItemCount>12</ChatSidebarItemCount>
                    </ChatSidebarItemAside>
                  </ChatSidebarItem>
                  <ChatSidebarItem
                    type="button"
                    active={selectedItem === "release"}
                    onClick={() => openDestination("release")}
                  >
                    <ChatSidebarItemChannelIcon aria-hidden>
                      <Hash />
                    </ChatSidebarItemChannelIcon>
                    <ChatSidebarItemContent>
                      <ChatSidebarItemTitle>release</ChatSidebarItemTitle>
                      <ChatSidebarItemMetaIcon
                        role="img"
                        aria-label="Activity muted"
                        title="Activity muted. Direct mentions can still notify you."
                      >
                        <BellOff aria-hidden />
                      </ChatSidebarItemMetaIcon>
                    </ChatSidebarItemContent>
                    <ChatSidebarItemAside>
                      <ChatSidebarItemMetaIcon role="img" aria-label="Draft">
                        <Pencil aria-hidden />
                      </ChatSidebarItemMetaIcon>
                    </ChatSidebarItemAside>
                  </ChatSidebarItem>
                </ChatSidebarList>
              )}
            </ChatSidebarSection>

            <ChatSidebarSection>
              <SidebarSectionHeaderMenu menu="sort">
                <ChatSidebarSectionDisclosure type="button">
                  <ChatSidebarSectionTitle>Direct Messages</ChatSidebarSectionTitle>
                  <ChatSidebarSectionChevron />
                </ChatSidebarSectionDisclosure>
                <ChatSidebarSectionTrailing>
                  <ChatSidebarSectionControls>
                    <SidebarSectionSortMenu aria-label="Sort direct messages" />
                  </ChatSidebarSectionControls>
                </ChatSidebarSectionTrailing>
              </SidebarSectionHeaderMenu>
              {isEmpty ? (
                <ChatSidebarSectionEmpty>No direct messages yet</ChatSidebarSectionEmpty>
              ) : (
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
                    <ChatSidebarItemContent>
                      <ChatSidebarItemTitle>Cindy</ChatSidebarItemTitle>
                      <ChatSidebarItemSubtitle>design</ChatSidebarItemSubtitle>
                    </ChatSidebarItemContent>
                    <ChatSidebarItemAside>
                      <ChatSidebarItemStatus>
                        <Status aria-hidden variant="success" size="md" />
                      </ChatSidebarItemStatus>
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
                    <ChatSidebarItemContent>
                      <ChatSidebarItemTitle>Atlas</ChatSidebarItemTitle>
                      <ChatSidebarItemSubtitle>idle</ChatSidebarItemSubtitle>
                    </ChatSidebarItemContent>
                    <ChatSidebarItemAside>
                      <ChatSidebarItemMetaIcon role="img" aria-label="Draft">
                        <Pencil aria-hidden />
                      </ChatSidebarItemMetaIcon>
                    </ChatSidebarItemAside>
                  </ChatSidebarItem>
                </ChatSidebarList>
              )}
            </ChatSidebarSection>
          </div>
        </ChatSidebarContent>
      </ChatSidebarBody>
      <ChatSidebarLiveActivity>
        <LiveAgentActivityBarComposition latest={LIVE_ACTIVITY[liveActivityState]} />
      </ChatSidebarLiveActivity>
    </ChatSidebarRoot>
  );
}
