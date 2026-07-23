import { Outlet, useMatch } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  AppShellMainSlot,
  AppShellRoot,
  AppShellSidebarSlot,
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
import { usePlaygroundDesktop, usePlaygroundLargeDesktop } from "./use-playground-desktop.ts";

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
      sidebarCollapsible={isDesktop}
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
  const sidebarDefaultSize = theme === "brutal" ? 240 : 252;

  if (!isDesktop) {
    return (
      <AppShellMainSlot className="h-full w-full bg-transparent">
        <div className={mobileListPanel ? "flex h-full w-full" : "hidden"}>{sidebar}</div>
        <div className={mobileListPanel ? "hidden" : "flex h-full w-full"}>{thread ?? main}</div>
      </AppShellMainSlot>
    );
  }

  return (
    <ResizableGroup orientation="horizontal" className="h-auto min-w-0 flex-1 md:h-full">
      <ResizablePanel
        id={`playground-sidebar-${theme}`}
        defaultSize={sidebarDefaultSize}
        minSize={180}
        maxSize={368}
        groupResizeBehavior="preserve-pixel-size"
        className="relative min-w-0"
      >
        <AppShellSidebarSlot className="relative flex h-full min-w-0 w-auto flex-1">
          {sidebar}
        </AppShellSidebarSlot>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="playground-main" minSize={360} className="relative !overflow-visible">
        <AppShellMainSlot className="flex h-full min-w-0 flex-1">
          {main}
          {thread && !isLargeDesktop ? (
            <div className="absolute inset-0 z-20 flex min-h-0 min-w-0 before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-30 before:w-px before:bg-line-subtle before:content-['']">
              {thread}
            </div>
          ) : null}
        </AppShellMainSlot>
      </ResizablePanel>
      {thread && isLargeDesktop ? (
        <>
          <ResizableHandle
            className={
              theme === "brutal"
                ? "z-50 ml-0 w-0 border-l-2 border-black bg-transparent"
                : "z-50 bg-transparent"
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
