import { Outlet, useMatch } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  AppShellMainSlot,
  AppShellPanelSlot,
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
  findPlaygroundTaskForMessage,
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
import { PlaygroundLegacyTaskPanel } from "../tasks/playground-legacy-task-panel.tsx";
import { usePlaygroundTaskState } from "../tasks/use-playground-task-state.ts";
import { PlaygroundThreadPanel } from "../thread/playground-thread-panel.tsx";
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
  const { from, panel, thread, legacyTask } =
    channelRouteMatch?.search ?? dmRouteMatch?.search ?? {};

  const channel =
    channelId && isPlaygroundChannelId(channelId)
      ? getPlaygroundChannel(channelId)
      : dmId && isPlaygroundDmId(dmId)
        ? getPlaygroundDirectMessage(dmId)
        : null;
  const activeLegacyTask =
    channel && legacyTask
      ? tasks.find((item) => item.id === legacyTask && item.legacy && item.channelId === channel.id)
      : undefined;
  const threadContext = !activeLegacyTask && thread ? getPlaygroundThread(thread) : undefined;
  const task =
    !activeLegacyTask && thread ? findPlaygroundTaskForMessage(tasks, thread) : undefined;
  const activeThread =
    channel && threadContext?.channelId === channel.id
      ? threadContext.thread
      : channel && task?.channelId === channel.id && !task.legacy
        ? getPlaygroundTaskThread(task)
        : undefined;
  const sidePanel = Boolean(activeLegacyTask || activeThread);
  const mobileListPanel = channel === null || (panel === "list" && !sidePanel);
  const liveAgentActor = getPlaygroundActor(PLAYGROUND_LIVE_AGENT_ACTIVITY.actorId);

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
          activeLegacyTask && channel ? (
            <PlaygroundLegacyTaskPanel
              key={activeLegacyTask.id}
              backToTasks={from === "tasks"}
              channel={channel}
              task={activeLegacyTask}
            />
          ) : activeThread && channel ? (
            <PlaygroundThreadPanel
              key={activeThread.parent.id}
              backToTasks={from === "tasks"}
              channel={channel}
              task={task}
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
      <ResizablePanel id="playground-main" minSize={360} className="relative z-0 !overflow-visible">
        <AppShellMainSlot className="flex h-full min-w-0 flex-1">
          {main}
          {thread && !isLargeDesktop ? (
            <div
              className={cn(
                "absolute inset-0 z-20 flex min-h-0 min-w-0",
                theme === "brutal" && "border-l-2 border-black",
              )}
            >
              {thread}
            </div>
          ) : null}
        </AppShellMainSlot>
      </ResizablePanel>
      {thread && isLargeDesktop ? (
        <>
          <ResizableHandle className="z-50" />
          <ResizablePanel
            id="playground-thread"
            defaultSize={400}
            minSize={360}
            maxSize="60vw"
            groupResizeBehavior="preserve-pixel-size"
            className="relative z-20 min-w-0 !overflow-visible"
          >
            <AppShellPanelSlot className="flex h-full min-w-0 flex-1">{thread}</AppShellPanelSlot>
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
      kind: "chat",
      senderType: getPlaygroundActor(task.creatorActorId).type === "agent" ? "agent" : "user",
      senderId: task.creatorActorId,
      createdAt: "",
      content: task.description ? `${task.title}\n${task.description}` : task.title,
      reactions: [],
    },
    replies: [],
  };
}
