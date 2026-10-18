import { AtSign, BellOff, Bookmark, Hash, Pencil } from "lucide-react";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import {
  Avatar,
  AvatarFallback,
  Status,
  SidebarLiveActivity,
  SidebarContent,
  SidebarItemAside,
  SidebarItemCount,
  SidebarBody,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarItem,
  SidebarItemIcon,
  SidebarItemChannelIcon,
  SidebarItemIndicator,
  SidebarItemMetaIcon,
  SidebarItemContent,
  SidebarItemStatus,
  SidebarItemSubtitle,
  SidebarItemTitle,
  SidebarList,
  SidebarMenu,
  SidebarMenuAside,
  SidebarMenuCount,
  SidebarMenuIcon,
  SidebarMenuTitle,
  SidebarRoot,
  SidebarSection,
  SidebarSectionEmpty,
  SidebarSectionControls,
  SidebarSectionAttention,
  SidebarSectionDisclosure,
  SidebarSectionChevron,
  SidebarSectionHeader,
  SidebarSectionTitle,
  SidebarSectionTrailing,
} from "@botiverse/raft-ui";

import {
  SidebarSectionAddButton,
  SidebarSectionChannelsMenu,
  SidebarCreateMenu,
  SidebarSectionHeaderMenu,
  SidebarSectionSortMenu,
} from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";
import { LiveAgentActivityBarComposition } from "#/modules/live-agent-activity-bar/live-agent-activity-bar.composition.tsx";
import type { LiveAgentActivityBarItem } from "#/modules/live-agent-activity-bar/live-agent-activity-bar.composition.tsx";

export type SidebarContentState = "populated" | "empty";
export type SidebarLiveActivityState = "none" | "active";

export type SidebarCompositionProps = {
  contentState?: SidebarContentState;
  liveActivityState?: SidebarLiveActivityState;
};

const LIVE_ACTIVITY: Record<SidebarLiveActivityState, LiveAgentActivityBarItem | null> = {
  none: null,
  active: { text: "Preparing the next release candidate" },
};

function SidebarDestinationItem({
  children,
  destination,
  selected,
  onOpen,
}: {
  children: ReactNode;
  destination: string;
  selected: boolean;
  onOpen: (destination: string) => void;
}) {
  const handleClick = useCallback(() => onOpen(destination), [destination, onOpen]);

  return (
    <SidebarItem type="button" active={selected} onClick={handleClick}>
      {children}
    </SidebarItem>
  );
}

export function SidebarComposition({
  contentState = "populated",
  liveActivityState = "none",
}: SidebarCompositionProps) {
  const [selectedItem, setSelectedItem] = useState("proj-uiux");
  const [announcement, setAnnouncement] = useState({ message: "Opened proj-uiux", sequence: 0 });
  const isEmpty = contentState === "empty";

  const announce = useCallback((message: string) => {
    setAnnouncement((current) => ({ message, sequence: current.sequence + 1 }));
  }, []);

  const openDestination = useCallback(
    (destination: string) => {
      setSelectedItem(destination);
      announce(`Opened ${destination}`);
    },
    [announce],
  );

  const handleCreateChannel = useCallback(() => announce("Create Channel"), [announce]);
  const handleCreateJoint = useCallback(() => announce("Create Joint Channel"), [announce]);
  const handleOpenSaved = useCallback(() => openDestination("Saved"), [openDestination]);

  return (
    <SidebarRoot className="overflow-x-clip">
      <SidebarHeader>
        <div className="min-w-0 flex-1">
          <SidebarHeaderTitle>Chat</SidebarHeaderTitle>
        </div>
        <span className="sr-only" aria-live="polite">
          <span key={announcement.sequence}>{announcement.message}</span>
        </span>
        <SidebarCreateMenu
          onCreateChannel={handleCreateChannel}
          onCreateJoint={handleCreateJoint}
        />
      </SidebarHeader>
      <SidebarBody>
        <SidebarContent className="min-h-0">
          <div className="min-h-full">
            <SidebarSection>
              <SidebarSectionHeader className="mt-0">
                <SidebarMenu
                  aria-current={selectedItem === "Saved" ? "page" : undefined}
                  onClick={handleOpenSaved}
                >
                  <SidebarMenuIcon>
                    <Bookmark />
                  </SidebarMenuIcon>
                  <SidebarMenuTitle>Saved</SidebarMenuTitle>
                  <SidebarMenuAside>
                    <SidebarMenuCount>2</SidebarMenuCount>
                  </SidebarMenuAside>
                </SidebarMenu>
              </SidebarSectionHeader>
            </SidebarSection>

            <SidebarSection>
              <SidebarSectionHeaderMenu menu="sort">
                <SidebarSectionDisclosure type="button">
                  <SidebarSectionTitle>Pinned</SidebarSectionTitle>
                  <SidebarSectionChevron />
                </SidebarSectionDisclosure>
                <SidebarSectionTrailing>
                  <SidebarSectionControls>
                    <SidebarSectionSortMenu aria-label="Sort pinned" />
                  </SidebarSectionControls>
                </SidebarSectionTrailing>
              </SidebarSectionHeaderMenu>
              {isEmpty ? (
                <SidebarSectionEmpty>No pinned conversations yet</SidebarSectionEmpty>
              ) : (
                <SidebarList>
                  <SidebarDestinationItem
                    destination="proj-uiux"
                    selected={selectedItem === "proj-uiux"}
                    onOpen={openDestination}
                  >
                    <SidebarItemChannelIcon aria-hidden>
                      <Hash />
                    </SidebarItemChannelIcon>
                    <SidebarItemContent>
                      <SidebarItemTitle className="shrink-0">proj-uiux</SidebarItemTitle>
                      <SidebarItemSubtitle>Cindy replied</SidebarItemSubtitle>
                    </SidebarItemContent>
                  </SidebarDestinationItem>
                  <SidebarDestinationItem
                    destination="Atlas planning"
                    selected={selectedItem === "Atlas planning"}
                    onOpen={openDestination}
                  >
                    <SidebarItemIcon>
                      <Avatar size="2xs" type="agent">
                        <AvatarFallback className="text-[9px] font-bold">A</AvatarFallback>
                      </Avatar>
                    </SidebarItemIcon>
                    <SidebarItemContent>
                      <SidebarItemTitle>Atlas</SidebarItemTitle>
                      <SidebarItemSubtitle>planning</SidebarItemSubtitle>
                    </SidebarItemContent>
                    <SidebarItemAside>
                      <SidebarItemStatus>
                        <Status aria-hidden variant="success" />
                      </SidebarItemStatus>
                    </SidebarItemAside>
                  </SidebarDestinationItem>
                  <SidebarDestinationItem
                    destination="proj-theme"
                    selected={selectedItem === "proj-theme"}
                    onOpen={openDestination}
                  >
                    <SidebarItemChannelIcon aria-hidden>
                      <Hash />
                    </SidebarItemChannelIcon>
                    <SidebarItemContent>
                      <SidebarItemTitle>proj-theme</SidebarItemTitle>
                    </SidebarItemContent>
                    <SidebarItemAside>
                      <SidebarItemMetaIcon role="img" aria-label="Draft">
                        <Pencil aria-hidden />
                      </SidebarItemMetaIcon>
                    </SidebarItemAside>
                  </SidebarDestinationItem>
                </SidebarList>
              )}
            </SidebarSection>

            <SidebarSection>
              <SidebarSectionHeaderMenu
                menu="channels"
                count={0}
                countLabel="channels"
                createLabel="Create Joint Channel"
                createIcon="joint"
                createDisabled
              >
                <SidebarSectionDisclosure type="button">
                  <SidebarSectionTitle>Joint Channels</SidebarSectionTitle>
                  <SidebarSectionChevron />
                </SidebarSectionDisclosure>
                <SidebarSectionTrailing>
                  <SidebarSectionAttention />
                  <SidebarSectionControls>
                    <SidebarSectionAddButton aria-label="Create joint channel" disabled />
                    <SidebarSectionChannelsMenu
                      aria-label="Joint channels menu"
                      count={1}
                      countLabel="channels"
                      createLabel="Create Joint Channel"
                      createIcon="joint"
                      createDisabled
                    />
                  </SidebarSectionControls>
                </SidebarSectionTrailing>
              </SidebarSectionHeaderMenu>
              <SidebarSectionEmpty>No joint channels yet</SidebarSectionEmpty>
            </SidebarSection>

            <SidebarSection>
              <SidebarSectionHeaderMenu
                menu="channels"
                count={isEmpty ? 0 : 2}
                countLabel="channels"
                createLabel="Create Channel"
                createIcon="channel"
                createDisabled
              >
                <SidebarSectionDisclosure type="button">
                  <SidebarSectionTitle>Channels</SidebarSectionTitle>
                  <SidebarSectionChevron />
                </SidebarSectionDisclosure>
                <SidebarSectionTrailing>
                  <SidebarSectionControls>
                    <SidebarSectionAddButton aria-label="Create channel" disabled />
                    <SidebarSectionChannelsMenu
                      aria-label="Channels menu"
                      count={isEmpty ? 0 : 2}
                      countLabel="channels"
                      createLabel="Create Channel"
                      createIcon="channel"
                      createDisabled
                    />
                  </SidebarSectionControls>
                </SidebarSectionTrailing>
              </SidebarSectionHeaderMenu>
              {isEmpty ? (
                <SidebarSectionEmpty>No channels yet</SidebarSectionEmpty>
              ) : (
                <SidebarList>
                  <SidebarDestinationItem
                    destination="general"
                    selected={selectedItem === "general"}
                    onOpen={openDestination}
                  >
                    <SidebarItemChannelIcon aria-hidden>
                      <Hash />
                    </SidebarItemChannelIcon>
                    <SidebarItemContent>
                      <SidebarItemTitle>general</SidebarItemTitle>
                    </SidebarItemContent>
                    <SidebarItemAside>
                      <SidebarItemIndicator role="img" aria-label="Mentioned you">
                        <AtSign aria-hidden />
                      </SidebarItemIndicator>
                      <SidebarItemCount>12</SidebarItemCount>
                    </SidebarItemAside>
                  </SidebarDestinationItem>
                  <SidebarDestinationItem
                    destination="release"
                    selected={selectedItem === "release"}
                    onOpen={openDestination}
                  >
                    <SidebarItemChannelIcon aria-hidden>
                      <Hash />
                    </SidebarItemChannelIcon>
                    <SidebarItemContent>
                      <SidebarItemTitle>release</SidebarItemTitle>
                      <SidebarItemMetaIcon
                        role="img"
                        aria-label="Activity muted"
                        title="Activity muted. Direct mentions can still notify you."
                      >
                        <BellOff aria-hidden />
                      </SidebarItemMetaIcon>
                    </SidebarItemContent>
                    <SidebarItemAside>
                      <SidebarItemMetaIcon role="img" aria-label="Draft">
                        <Pencil aria-hidden />
                      </SidebarItemMetaIcon>
                    </SidebarItemAside>
                  </SidebarDestinationItem>
                </SidebarList>
              )}
            </SidebarSection>

            <SidebarSection>
              <SidebarSectionHeaderMenu menu="sort">
                <SidebarSectionDisclosure type="button">
                  <SidebarSectionTitle>Direct Messages</SidebarSectionTitle>
                  <SidebarSectionChevron />
                </SidebarSectionDisclosure>
                <SidebarSectionTrailing>
                  <SidebarSectionControls>
                    <SidebarSectionSortMenu aria-label="Sort direct messages" />
                  </SidebarSectionControls>
                </SidebarSectionTrailing>
              </SidebarSectionHeaderMenu>
              {isEmpty ? (
                <SidebarSectionEmpty>No direct messages yet</SidebarSectionEmpty>
              ) : (
                <SidebarList>
                  <SidebarDestinationItem
                    destination="Cindy"
                    selected={selectedItem === "Cindy"}
                    onOpen={openDestination}
                  >
                    <SidebarItemIcon>
                      <Avatar size="2xs" type="human">
                        <AvatarFallback className="text-[9px] font-bold">C</AvatarFallback>
                      </Avatar>
                    </SidebarItemIcon>
                    <SidebarItemContent>
                      <SidebarItemTitle>Cindy</SidebarItemTitle>
                      <SidebarItemSubtitle>design</SidebarItemSubtitle>
                    </SidebarItemContent>
                    <SidebarItemAside>
                      <SidebarItemStatus>
                        <Status aria-hidden variant="success" />
                      </SidebarItemStatus>
                      <SidebarItemCount>4</SidebarItemCount>
                    </SidebarItemAside>
                  </SidebarDestinationItem>
                  <SidebarDestinationItem
                    destination="Atlas idle"
                    selected={selectedItem === "Atlas idle"}
                    onOpen={openDestination}
                  >
                    <SidebarItemIcon>
                      <Avatar size="2xs" type="agent" />
                    </SidebarItemIcon>
                    <SidebarItemContent>
                      <SidebarItemTitle>Atlas</SidebarItemTitle>
                      <SidebarItemSubtitle>idle</SidebarItemSubtitle>
                    </SidebarItemContent>
                    <SidebarItemAside>
                      <SidebarItemMetaIcon role="img" aria-label="Draft">
                        <Pencil aria-hidden />
                      </SidebarItemMetaIcon>
                    </SidebarItemAside>
                  </SidebarDestinationItem>
                </SidebarList>
              )}
            </SidebarSection>
          </div>
        </SidebarContent>
      </SidebarBody>
      <SidebarLiveActivity>
        <LiveAgentActivityBarComposition latest={LIVE_ACTIVITY[liveActivityState]} />
      </SidebarLiveActivity>
    </SidebarRoot>
  );
}
