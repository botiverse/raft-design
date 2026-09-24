import { Outlet, useMatch, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShellRoot, useThemeFamily } from "raft-ui";
import { cn } from "raft-ui/cn";

import { PlaygroundChatLayout } from "../app-shell/playground-chat-layout.tsx";
import {
  usePlaygroundDesktop,
  usePlaygroundLargeDesktop,
} from "../app-shell/use-playground-desktop.ts";
import { getPlaygroundTopicChannel, isPlaygroundTopicChannelId } from "../mock/index.ts";
import { PlaygroundRail } from "../rail/playground-rail.tsx";
import { PlaygroundTopicPanel } from "./topic-panel.tsx";
import { isTopicUnread } from "./topic-queries.ts";
import { PlaygroundTopicsSidebar } from "./topics-sidebar.tsx";
import { usePlaygroundTopicState } from "./use-playground-topic-state.ts";

export function PlaygroundTopicsShell() {
  const channelMatch = useMatch({
    from: "/playground/topics/$channelId",
    shouldThrow: false,
  });
  const navigate = useNavigate();
  const theme = useThemeFamily();
  const isDesktop = usePlaygroundDesktop();
  const isLargeDesktop = usePlaygroundLargeDesktop();
  const { topics, markRead } = usePlaygroundTopicState();
  const channelId = channelMatch?.params.channelId;
  const channel =
    channelId && isPlaygroundTopicChannelId(channelId)
      ? getPlaygroundTopicChannel(channelId)
      : null;
  const topicId = channelMatch?.search.topic;
  const topic =
    channel && topicId
      ? topics.find((candidate) => candidate.id === topicId && candidate.channelId === channel.id)
      : undefined;
  const mobileListPanel = channel === null;

  const topicUnread = topic ? isTopicUnread(topic) : false;
  useEffect(() => {
    if (topic && topicUnread) markRead(topic.id);
  }, [markRead, topic, topicUnread]);

  // Session-created topics are gone after a reload; drop the dangling selection.
  const danglingTopic = Boolean(channel && topicId && !topic);
  useEffect(() => {
    if (!danglingTopic || !channel) return;
    void navigate({
      to: "/playground/topics/$channelId",
      params: { channelId: channel.id },
      search: {},
      replace: true,
    });
  }, [channel, danglingTopic, navigate]);

  return (
    <AppShellRoot
      sidebarCollapsible={isDesktop}
      className={cn(
        "h-full max-md:h-dvh max-md:overflow-hidden",
        theme === "brutal" && (mobileListPanel ? "max-md:bg-primary" : "max-md:bg-white"),
      )}
    >
      <PlaygroundRail showBottomNavigation={mobileListPanel} />
      <PlaygroundChatLayout
        isDesktop={isDesktop}
        isLargeDesktop={isLargeDesktop}
        mobileListPanel={mobileListPanel}
        sidebar={
          <PlaygroundTopicsSidebar
            activeChannelId={channel?.id ?? null}
            mobileBottomNavigation={mobileListPanel}
          />
        }
        main={<Outlet />}
        theme={theme}
        thread={
          channel && topic ? (
            <PlaygroundTopicPanel key={topic.id} channel={channel} topic={topic} />
          ) : undefined
        }
      />
    </AppShellRoot>
  );
}
