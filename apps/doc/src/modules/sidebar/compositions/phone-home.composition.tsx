import {
  Activity,
  AtSign,
  Bookmark,
  CheckSquare,
  ChevronDown,
  Ellipsis,
  Hash,
  Home,
} from "lucide-react";
import { useCallback, useState } from "react";
import type { MouseEvent } from "react";
import {
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Button,
  MobileNavItem,
  MobileNavLabel,
  MobileNavRoot,
  NotificationCenter,
  NotificationCenterTrigger,
  PanelActions,
  PanelSectionHeader,
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
  SidebarBody,
  SidebarContent,
  SidebarItem,
  SidebarItemAside,
  SidebarItemChannelIcon,
  SidebarItemContent,
  SidebarItemCount,
  SidebarItemIcon,
  SidebarItemIndicator,
  SidebarItemMeta,
  SidebarItemSubtitle,
  SidebarItemTitle,
  SidebarList,
  SidebarRoot,
  SidebarSection,
  SidebarSectionChevron,
  SidebarSectionCount,
  SidebarSectionDisclosure,
  SidebarSectionHeader,
  SidebarSectionTitle,
  Text,
} from "@botiverse/raft-ui";

import {
  SidebarServer,
  SidebarServerChevron,
  SidebarServerLabel,
} from "../sidebar-server-switcher";

export function SidebarPhoneHomeComposition() {
  const [opened, setOpened] = useState("");
  const [announcement, setAnnouncement] = useState({ message: "", sequence: 0 });
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);

  const handleOpen = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const { value } = event.currentTarget;
    setOpened(value);
    setAnnouncement((current) => ({ message: `Opened ${value}`, sequence: current.sequence + 1 }));
  }, []);
  const toggleChannels = useCallback(() => setChannelsOpen((open) => !open), []);
  const toggleDms = useCallback(() => setDmsOpen((open) => !open), []);

  return (
    <div className="flex h-dvh w-full max-w-sm flex-col">
      <PanelSectionHeader>
        <SidebarServer render={<button type="button" value="workspaces" onClick={handleOpen} />}>
          <SidebarServerLabel>Launch Crew</SidebarServerLabel>
          <SidebarServerChevron aria-hidden>
            <ChevronDown />
          </SidebarServerChevron>
        </SidebarServer>
        <PanelActions className="ml-auto">
          <Popover>
            <PopoverTrigger
              render={<Button variant="ghost" size="sm" aria-label="2 agents working" />}
            >
              <AvatarGroup aria-hidden>
                <Avatar size="xs" type="agent" />
                <Avatar size="xs" type="agent" />
              </AvatarGroup>
              <Text.Mono size="meta">2</Text.Mono>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[300px]">
              <PopoverTitle>Working now</PopoverTitle>
              <SidebarList>
                <SidebarItem value="bugen" onClick={handleOpen}>
                  <SidebarItemIcon>
                    <Avatar size="2xs" type="agent">
                      <AvatarBadge presence="busy" aria-hidden />
                    </Avatar>
                  </SidebarItemIcon>
                  <SidebarItemContent>
                    <SidebarItemTitle>Bugen</SidebarItemTitle>
                    <SidebarItemSubtitle>Editing Flow.tsx · #25</SidebarItemSubtitle>
                  </SidebarItemContent>
                </SidebarItem>
                <SidebarItem value="wug" onClick={handleOpen}>
                  <SidebarItemIcon>
                    <Avatar size="2xs" type="agent">
                      <AvatarBadge presence="busy" aria-hidden />
                    </Avatar>
                  </SidebarItemIcon>
                  <SidebarItemContent>
                    <SidebarItemTitle>Wug</SidebarItemTitle>
                    <SidebarItemSubtitle>Drafting release notes · #31</SidebarItemSubtitle>
                  </SidebarItemContent>
                </SidebarItem>
              </SidebarList>
            </PopoverContent>
          </Popover>
          <NotificationCenter>
            <NotificationCenterTrigger type="button" aria-label="Notifications" />
          </NotificationCenter>
        </PanelActions>
      </PanelSectionHeader>

      <SidebarRoot className="min-h-0 flex-1">
        <SidebarBody>
          <SidebarContent>
            <SidebarList>
              <SidebarItem value="saved" onClick={handleOpen}>
                <SidebarItemIcon>
                  <Bookmark />
                </SidebarItemIcon>
                <SidebarItemContent>
                  <SidebarItemTitle>Saved</SidebarItemTitle>
                </SidebarItemContent>
                <SidebarItemMeta aria-label="4 saved">4</SidebarItemMeta>
              </SidebarItem>
            </SidebarList>

            <SidebarSection>
              <SidebarSectionHeader>
                <SidebarSectionDisclosure
                  type="button"
                  aria-expanded={channelsOpen}
                  onClick={toggleChannels}
                >
                  <SidebarSectionChevron />
                  <SidebarSectionTitle>Channels</SidebarSectionTitle>
                  <SidebarSectionCount>2</SidebarSectionCount>
                </SidebarSectionDisclosure>
              </SidebarSectionHeader>
              {channelsOpen ? (
                <SidebarList>
                  <SidebarItem
                    value="launch-week"
                    active={opened === "launch-week"}
                    onClick={handleOpen}
                  >
                    <SidebarItemChannelIcon aria-hidden>
                      <Hash />
                    </SidebarItemChannelIcon>
                    <SidebarItemContent>
                      <SidebarItemTitle>launch-week</SidebarItemTitle>
                    </SidebarItemContent>
                    <SidebarItemAside>
                      <SidebarItemIndicator role="img" aria-label="Mentions you">
                        <AtSign aria-hidden />
                      </SidebarItemIndicator>
                      <SidebarItemCount>5</SidebarItemCount>
                    </SidebarItemAside>
                  </SidebarItem>
                  <SidebarItem value="design" active={opened === "design"} onClick={handleOpen}>
                    <SidebarItemChannelIcon aria-hidden>
                      <Hash />
                    </SidebarItemChannelIcon>
                    <SidebarItemContent>
                      <SidebarItemTitle>design</SidebarItemTitle>
                    </SidebarItemContent>
                  </SidebarItem>
                </SidebarList>
              ) : null}
            </SidebarSection>

            <SidebarSection>
              <SidebarSectionHeader>
                <SidebarSectionDisclosure type="button" aria-expanded={dmsOpen} onClick={toggleDms}>
                  <SidebarSectionChevron />
                  <SidebarSectionTitle>Direct Messages</SidebarSectionTitle>
                  <SidebarSectionCount>3</SidebarSectionCount>
                </SidebarSectionDisclosure>
              </SidebarSectionHeader>
              {dmsOpen ? (
                <SidebarList>
                  <SidebarItem value="bugen-dm" active={opened === "bugen-dm"} onClick={handleOpen}>
                    <SidebarItemIcon>
                      <Avatar size="2xs" type="agent">
                        <AvatarBadge presence="busy" aria-label="Working" />
                      </Avatar>
                    </SidebarItemIcon>
                    <SidebarItemContent>
                      <SidebarItemTitle>Bugen</SidebarItemTitle>
                    </SidebarItemContent>
                    <SidebarItemMeta>Editing Flow.tsx · #25</SidebarItemMeta>
                  </SidebarItem>
                  <SidebarItem value="wug-dm" active={opened === "wug-dm"} onClick={handleOpen}>
                    <SidebarItemIcon>
                      <Avatar size="2xs" type="agent">
                        <AvatarBadge presence="online" aria-label="Online" />
                      </Avatar>
                    </SidebarItemIcon>
                    <SidebarItemContent>
                      <SidebarItemTitle>Wug</SidebarItemTitle>
                    </SidebarItemContent>
                    <SidebarItemMeta>Codex</SidebarItemMeta>
                  </SidebarItem>
                  <SidebarItem
                    value="martin-dm"
                    active={opened === "martin-dm"}
                    onClick={handleOpen}
                  >
                    <SidebarItemIcon>
                      <Avatar size="2xs" type="human" />
                    </SidebarItemIcon>
                    <SidebarItemContent>
                      <SidebarItemTitle>Martin</SidebarItemTitle>
                    </SidebarItemContent>
                    <SidebarItemAside>
                      <SidebarItemCount>1</SidebarItemCount>
                    </SidebarItemAside>
                  </SidebarItem>
                </SidebarList>
              ) : null}
            </SidebarSection>
          </SidebarContent>
        </SidebarBody>
      </SidebarRoot>

      <MobileNavRoot aria-label="Primary navigation">
        <MobileNavItem selected value="home" onClick={handleOpen} aria-label="Home">
          <Home />
          <MobileNavLabel>Home</MobileNavLabel>
        </MobileNavItem>
        <MobileNavItem value="activity" onClick={handleOpen} aria-label="Activity">
          <Activity />
          <MobileNavLabel>Activity</MobileNavLabel>
        </MobileNavItem>
        <MobileNavItem value="tasks" onClick={handleOpen} aria-label="Tasks">
          <CheckSquare />
          <MobileNavLabel>Tasks</MobileNavLabel>
        </MobileNavItem>
        <MobileNavItem value="more" onClick={handleOpen} aria-label="More">
          <Ellipsis />
          <MobileNavLabel>More</MobileNavLabel>
        </MobileNavItem>
      </MobileNavRoot>
      {/* @docs-source-strip-start */}
      <span className="sr-only" aria-live="polite">
        <span key={announcement.sequence}>{announcement.message}</span>
      </span>
      {/* @docs-source-strip-end */}
    </div>
  );
}
