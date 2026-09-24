import { Link } from "@tanstack/react-router";
import { useMediaQuery } from "foxact/use-media-query";
import {
  SidebarBody,
  SidebarContent,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarItem,
  SidebarItemAside,
  SidebarItemChannelIcon,
  SidebarItemContent,
  SidebarItemCount,
  SidebarItemIcon,
  SidebarItemTitle,
  SidebarList,
  SidebarRoot,
  SidebarSection,
  SidebarSectionAttention,
  SidebarSectionChevron,
  SidebarSectionDisclosure,
  SidebarSectionHeader,
  SidebarSectionTitle,
  SidebarSectionTrailing,
} from "raft-ui";

import { usePlaygroundShellState } from "../app-shell/use-playground-shell-state.ts";
import { PLAYGROUND_TOPIC_CHANNEL_GROUPS, PLAYGROUND_TOPIC_CHANNELS } from "../mock/index.ts";
import type { PlaygroundTopicChannelId } from "../mock/index.ts";
import {
  PlaygroundNotificationCenter,
  PlaygroundSidebarServerSwitcher,
} from "../rail/playground-rail.tsx";
import { getTopicChannelIcon } from "./topic-channel-icon.ts";
import { isTopicUnread } from "./topic-queries.ts";
import { usePlaygroundTopicState } from "./use-playground-topic-state.ts";

export function PlaygroundTopicsSidebar({
  activeChannelId,
  mobileBottomNavigation = false,
}: {
  activeChannelId: PlaygroundTopicChannelId | null;
  mobileBottomNavigation?: boolean;
}) {
  const { activeServer } = usePlaygroundShellState();
  const { topics } = usePlaygroundTopicState();
  const isDesktop = useMediaQuery("(min-width: 768px)", false);
  const selectedChannelId = isDesktop ? activeChannelId : null;
  const unreadCountByChannel = new Map<string, number>();
  for (const topic of topics) {
    if (isTopicUnread(topic)) {
      unreadCountByChannel.set(
        topic.channelId,
        (unreadCountByChannel.get(topic.channelId) ?? 0) + 1,
      );
    }
  }

  return (
    <SidebarRoot>
      <SidebarHeader className="md:hidden">
        <PlaygroundSidebarServerSwitcher name={activeServer.name} />
        <div className="min-w-0 flex-1" />
        <PlaygroundNotificationCenter mobile />
      </SidebarHeader>
      <SidebarHeader className="max-md:hidden">
        <div className="min-w-0 flex-1">
          <SidebarHeaderTitle className="leading-tight">Topics</SidebarHeaderTitle>
        </div>
      </SidebarHeader>
      <SidebarBody>
        <SidebarContent
          className={
            mobileBottomNavigation
              ? "max-md:pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))]"
              : undefined
          }
        >
          {PLAYGROUND_TOPIC_CHANNEL_GROUPS.map((group) => {
            const channels = PLAYGROUND_TOPIC_CHANNELS.filter(
              (channel) => channel.groupId === group.id,
            );
            const groupUnread = channels.some((channel) => unreadCountByChannel.has(channel.id));
            return (
              <SidebarSection key={group.id}>
                <SidebarSectionHeader>
                  <SidebarSectionDisclosure>
                    <SidebarSectionTitle>{group.label}</SidebarSectionTitle>
                    <SidebarSectionChevron />
                  </SidebarSectionDisclosure>
                  {groupUnread ? (
                    <SidebarSectionTrailing>
                      <SidebarSectionAttention />
                    </SidebarSectionTrailing>
                  ) : null}
                </SidebarSectionHeader>
                <SidebarList>
                  {channels.map((channel) => {
                    const active = selectedChannelId === channel.id;
                    const unreadCount = unreadCountByChannel.get(channel.id) ?? 0;
                    const ChannelIcon = getTopicChannelIcon(channel);
                    return (
                      <SidebarItem
                        key={channel.id}
                        active={active}
                        variant="accent"
                        aria-current={active ? "page" : undefined}
                        render={
                          <Link
                            to="/playground/topics/$channelId"
                            params={{ channelId: channel.id }}
                            search={{}}
                          />
                        }
                      >
                        <SidebarItemIcon aria-hidden>
                          <SidebarItemChannelIcon>
                            <ChannelIcon />
                          </SidebarItemChannelIcon>
                        </SidebarItemIcon>
                        <SidebarItemContent>
                          <SidebarItemTitle>{channel.name}</SidebarItemTitle>
                        </SidebarItemContent>
                        {unreadCount > 0 && !active ? (
                          <SidebarItemAside>
                            <SidebarItemCount>
                              {unreadCount}
                              <span className="sr-only">
                                {unreadCount === 1 ? " unread topic" : " unread topics"}
                              </span>
                            </SidebarItemCount>
                          </SidebarItemAside>
                        ) : null}
                      </SidebarItem>
                    );
                  })}
                </SidebarList>
              </SidebarSection>
            );
          })}
        </SidebarContent>
      </SidebarBody>
    </SidebarRoot>
  );
}
