import { Outlet, useMatch } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  AppShellMainSlot,
  AppShellRoot,
  ResizableGroup,
  ResizableHandle,
  ResizablePanel,
  useThemeFamily,
} from "raft-ui";
import { cn } from "raft-ui/cn";

import {
  PLAYGROUND_LIVE_AGENT_ACTIVITY,
  getPlaygroundActor,
  getPlaygroundChannel,
  getPlaygroundDirectMessage,
  getPlaygroundThread,
  isPlaygroundChannelId,
  isPlaygroundDmId,
  type PlaygroundTask,
  type PlaygroundThread,
} from "../mock/index.ts";
import { PlaygroundRail } from "../rail/playground-rail.tsx";
import { PlaygroundSidebar } from "../chat-sidebar/chat-sidebar.tsx";
import { PlaygroundThreadPanel } from "../thread/playground-thread-panel.tsx";
import { usePlaygroundTaskState } from "../tasks/use-playground-task-state.ts";
import { usePlaygroundShellState } from "./use-playground-shell-state.ts";
import { usePlaygroundDesktop, usePlaygroundLargeDesktop } from "./use-playground-desktop.ts";
import { useSidebarPanelLayout } from "./use-sidebar-panel-layout.ts";
import { PlaygroundSidebarPresence } from "./playground-sidebar-presence.tsx";

export function PlaygroundChatShell() {
  const channelMatch = useMatch({
    from: "/playground/s/$serverSlug/channel/$channelId",
    shouldThrow: false,
  });
  const dmMatch = useMatch({
    from: "/playground/s/$serverSlug/dm/$dmId",
    shouldThrow: false,
  });
  const channelRouteMatch = useMatch({
    from: "/playground/s/$serverSlug/channel",
    shouldThrow: false,
  });
  const dmRouteMatch = useMatch({
    from: "/playground/s/$serverSlug/dm",
    shouldThrow: false,
  });
  const { tasks } = usePlaygroundTaskState();
  const { sidebarCollapsed } = usePlaygroundShellState();
  const theme = useThemeFamily();
  const isDesktop = usePlaygroundDesktop();
  const isLargeDesktop = usePlaygroundLargeDesktop();
  const channelId = channelMatch?.params.channelId;
  const dmId = dmMatch?.params.dmId;
  const { from, panel, thread } = channelRouteMatch?.search ?? dmRouteMatch?.search ?? {};

  const channel =
    channelId && isPlaygroundChannelId(channelId)
      ? getPlaygroundChannel(channelId)
      : dmId && isPlaygroundDmId(dmId)
        ? getPlaygroundDirectMessage(dmId)
        : null;
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
        "h-full max-md:h-dvh max-md:overflow-hidden",
        theme === "brutal" && (mobileListPanel ? "max-md:bg-soft-signal" : "max-md:bg-white"),
      )}
    >
      <PlaygroundRail showBottomNavigation={mobileListPanel} />
      <PlaygroundChatLayout
        isDesktop={isDesktop}
        isLargeDesktop={isLargeDesktop}
        mobileListPanel={mobileListPanel}
        sidebarCollapsed={sidebarCollapsed}
        sidebar={
          <PlaygroundSidebar
            activeChannelId={channel?.id ?? null}
            liveAgentActivity={{
              agentAvatarSrc: liveAgentActor.avatarSrc,
              text: PLAYGROUND_LIVE_AGENT_ACTIVITY.text,
            }}
            mobileBottomNavigation={mobileListPanel}
            title="Chat"
          />
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
  sidebarCollapsed,
  sidebar,
  theme,
  thread,
}: {
  isDesktop: boolean;
  isLargeDesktop: boolean;
  main: ReactNode;
  mobileListPanel: boolean;
  sidebarCollapsed: boolean;
  sidebar: ReactNode;
  theme: "brutal" | "elegant";
  thread?: ReactNode;
}) {
  const sidebarPanelRef = useSidebarPanelLayout({
    active: isDesktop,
    collapsed: sidebarCollapsed,
  });

  if (!isDesktop) {
    return (
      <AppShellMainSlot className="h-full w-full bg-transparent">
        <div className={mobileListPanel ? "flex h-full w-full" : "hidden"}>{sidebar}</div>
        <div className={mobileListPanel ? "hidden" : "flex h-full w-full"}>{thread ?? main}</div>
      </AppShellMainSlot>
    );
  }

  return (
    <ResizableGroup
      orientation="horizontal"
      className="h-auto min-w-0 flex-1 [&>[data-panel]]:transition-[flex] [&>[data-panel]]:duration-[220ms] [&>[data-panel]]:ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:[&>[data-panel]]:transition-none md:h-full"
    >
      <ResizablePanel
        id={`playground-sidebar-${theme}`}
        defaultSize={theme === "brutal" ? 240 : 252}
        minSize={180}
        maxSize={368}
        collapsible
        collapsedSize={0}
        groupResizeBehavior="preserve-pixel-size"
        panelRef={sidebarPanelRef}
        className="relative min-w-0"
      >
        <PlaygroundSidebarPresence collapsed={sidebarCollapsed}>
          {sidebar}
        </PlaygroundSidebarPresence>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="playground-main" minSize={360} className="relative min-w-0">
        <AppShellMainSlot className="flex h-full">{main}</AppShellMainSlot>
        {thread && !isLargeDesktop ? (
          <div className="absolute inset-0 z-20 flex min-h-0 min-w-0 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-30 before:w-px before:bg-line-subtle before:content-['']">
            {thread}
          </div>
        ) : null}
      </ResizablePanel>
      {thread && isLargeDesktop ? (
        <>
          <ResizableHandle
            className={
              theme === "brutal"
                ? "z-50 ml-0 w-0 border-l-2 border-black bg-transparent"
                : "z-50 bg-line-subtle"
            }
          />
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
      channelId: task.channelId,
      senderType: getPlaygroundActor(task.creatorActorId).type === "agent" ? "agent" : "user",
      senderId: task.creatorActorId,
      messageType: "chat",
      createdAt: `Task #${task.number}`,
      content: task.description ? `${task.title}\n${task.description}` : task.title,
      reactions: [],
    },
    replies: [],
  };
}
