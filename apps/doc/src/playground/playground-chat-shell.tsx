import { Outlet, useMatch } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useThemeFamily } from "raft-ui";
import { ResizableGroup, ResizableHandle, ResizablePanel } from "raft-ui";
import { cn } from "raft-ui/cn";
import { AppShellMainSlot, AppShellRoot, AppShellSidebarSlot } from "raft-ui/wip";

import {
  PLAYGROUND_LIVE_AGENT_ACTIVITY,
  getPlaygroundActor,
  getPlaygroundChannel,
  getPlaygroundThread,
  isPlaygroundChannelId,
  type PlaygroundTask,
  type PlaygroundThread,
} from "./mock/index.ts";
import { PlaygroundRail } from "./playground-rail.tsx";
import { PlaygroundSidebar } from "./playground-sidebar.tsx";
import { PlaygroundThreadPanel } from "./playground-thread-panel.tsx";
import { usePlaygroundTaskState } from "./playground-task-state.tsx";
import { usePlaygroundDesktop, usePlaygroundLargeDesktop } from "./use-playground-desktop.ts";

export function PlaygroundChatShell() {
  const channelMatch = useMatch({
    from: "/playground/s/$serverSlug/channel/$channelId",
    shouldThrow: false,
  });
  const channelRouteMatch = useMatch({
    from: "/playground/s/$serverSlug/channel",
    shouldThrow: false,
  });
  const { tasks } = usePlaygroundTaskState();
  const theme = useThemeFamily();
  const isDesktop = usePlaygroundDesktop();
  const isLargeDesktop = usePlaygroundLargeDesktop();
  const channelId = channelMatch?.params.channelId;
  const { from, panel, thread } = channelRouteMatch?.search ?? {};

  const channel =
    channelId && isPlaygroundChannelId(channelId) ? getPlaygroundChannel(channelId) : null;
  const threadContext = thread ? getPlaygroundThread(thread) : undefined;
  const task = thread ? tasks.find((item) => item.id === thread) : undefined;
  const activeThread =
    channel && threadContext?.channelId === channel.id
      ? threadContext.thread
      : channel && task?.channelId === channel.id
        ? getPlaygroundTaskThread(task)
        : undefined;
  const mobileListPanel = channel === null || (panel === "list" && !activeThread);
  const liveAgentActor = getPlaygroundActor(PLAYGROUND_LIVE_AGENT_ACTIVITY.actorId);

  return (
    <AppShellRoot
      className={cn(
        "h-full",
        theme === "brutal" && (mobileListPanel ? "max-md:bg-soft-signal" : "max-md:bg-white"),
      )}
    >
      <PlaygroundRail showBottomNavigation={mobileListPanel} />
      <PlaygroundChatLayout
        isDesktop={isDesktop}
        isLargeDesktop={isLargeDesktop}
        mobileListPanel={mobileListPanel}
        sidebar={
          <AppShellSidebarSlot
            className={cn(
              "relative flex h-full min-w-0",
              isDesktop ? "w-auto flex-1 shrink" : "!w-full !flex-none !shrink-0",
            )}
          >
            <PlaygroundSidebar
              activeChannelId={channel?.id ?? null}
              liveAgentActivity={{
                agentAvatarSrc: liveAgentActor.avatarSrc,
                text: PLAYGROUND_LIVE_AGENT_ACTIVITY.text,
              }}
              mobileBottomNavigation={mobileListPanel}
              title="Chat"
            />
          </AppShellSidebarSlot>
        }
        main={<Outlet />}
        theme={theme}
        thread={
          activeThread && channel ? (
            <PlaygroundThreadPanel
              key={activeThread.parent.id}
              backToTasks={from === "tasks"}
              channel={channel}
              thread={activeThread}
            />
          ) : undefined
        }
      />
    </AppShellRoot>
  );
}

function PlaygroundChatLayout({
  isDesktop,
  isLargeDesktop,
  main,
  mobileListPanel,
  sidebar,
  theme,
  thread,
}: {
  isDesktop: boolean;
  isLargeDesktop: boolean;
  main: ReactNode;
  mobileListPanel: boolean;
  sidebar: ReactNode;
  theme: "brutal" | "elegant";
  thread?: ReactNode;
}) {
  if (!isDesktop) {
    return (
      <div className="flex h-full min-h-0 min-w-0 flex-1">
        {mobileListPanel
          ? sidebar
          : (thread ?? <AppShellMainSlot className="flex h-full">{main}</AppShellMainSlot>)}
      </div>
    );
  }

  return (
    <ResizableGroup orientation="horizontal" className="h-auto min-w-0 flex-1 md:h-full">
      <ResizablePanel
        id={`playground-sidebar-${theme}`}
        defaultSize={theme === "brutal" ? 240 : 252}
        minSize={180}
        maxSize={368}
        groupResizeBehavior="preserve-pixel-size"
        className="min-w-0"
      >
        {sidebar}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="playground-main" minSize={360} className="relative min-w-0">
        <AppShellMainSlot className="flex h-full">{main}</AppShellMainSlot>
        {thread && !isLargeDesktop ? (
          <div className="absolute inset-0 z-20 flex min-h-0 min-w-0">{thread}</div>
        ) : null}
      </ResizablePanel>
      {thread && isLargeDesktop ? (
        <>
          <ResizableHandle />
          <ResizablePanel
            id="playground-thread"
            defaultSize={400}
            minSize={360}
            maxSize="60vw"
            groupResizeBehavior="preserve-pixel-size"
            className="min-w-0"
          >
            {thread}
          </ResizablePanel>
        </>
      ) : null}
    </ResizableGroup>
  );
}

function getPlaygroundTaskThread(task: PlaygroundTask): PlaygroundThread {
  return {
    parent: {
      id: task.id,
      authorId: task.creatorActorId,
      time: `Task #${task.number}`,
      body: task.description ? `${task.title}\n${task.description}` : task.title,
      reactions: [],
    },
    replies: [],
  };
}
