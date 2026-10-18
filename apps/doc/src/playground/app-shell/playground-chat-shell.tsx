import { Outlet, useMatch } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  AppShellMainSlot,
  AppShellOverlaySlot,
  AppShellPanelSlot,
  AppShellRoot,
  AppShellSidebarSlot,
  ResizableGroup,
  ResizableHandle,
  ResizablePanel,
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
} from "../mock/index.ts";
import type { PlaygroundTask, PlaygroundThread } from "../mock/index.ts";
import { PlaygroundRail } from "../rail/playground-rail.tsx";
import { PlaygroundSidebar } from "../chat-sidebar/chat-sidebar.tsx";
import { PlaygroundLegacyTaskPanel } from "../tasks/playground-legacy-task-panel.tsx";
import { usePlaygroundTaskState } from "../tasks/use-playground-task-state.ts";
import { PlaygroundThreadPanel } from "../thread/playground-thread-panel.tsx";
import { usePlaygroundDesktop, usePlaygroundLargeDesktop } from "./use-playground-desktop.ts";

const LIVE_AGENT_ACTIVITY = {
  agentAvatarSrc: getPlaygroundActor(PLAYGROUND_LIVE_AGENT_ACTIVITY.actorId).avatarSrc,
  text: PLAYGROUND_LIVE_AGENT_ACTIVITY.text,
};

export function PlaygroundChatShell() {
  const savedMatch = useMatch({
    from: "/playground/s/$serverSlug/saved",
    shouldThrow: false,
  });
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
  const mobileListPanel = !savedMatch && (channel === null || (panel === "list" && !sidePanel));

  return (
    <AppShellRoot
      sidebarCollapsible={isDesktop}
      className={cn(
        "h-full max-md:h-dvh max-md:overflow-hidden",
        mobileListPanel && "max-md:bg-layer-frame",
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
            liveAgentActivity={LIVE_AGENT_ACTIVITY}
            mobileBottomNavigation={mobileListPanel}
            title="Chat"
          />
        }
        main={<Outlet />}
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
  thread,
}: {
  isDesktop: boolean;
  isLargeDesktop: boolean;
  main: ReactNode;
  mobileListPanel: boolean;
  sidebar: ReactNode;
  thread?: ReactNode;
}) {
  if (!isDesktop) {
    return (
      <AppShellMainSlot className="size-full ">
        <div className={mobileListPanel ? "flex size-full " : "hidden"}>{sidebar}</div>
        <div className={mobileListPanel ? "hidden" : "flex size-full "}>{thread ?? main}</div>
      </AppShellMainSlot>
    );
  }

  return (
    <ResizableGroup orientation="horizontal" className="h-auto min-w-0 flex-1 md:h-full">
      <ResizablePanel
        id="playground-sidebar"
        defaultSize={240}
        minSize={180}
        maxSize={368}
        groupResizeBehavior="preserve-pixel-size"
        className="relative min-w-0"
      >
        <AppShellSidebarSlot className="relative flex h-full w-auto min-w-0 flex-1">
          {sidebar}
        </AppShellSidebarSlot>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="playground-main" minSize={360} className="relative z-0 overflow-visible!">
        <AppShellMainSlot overlay className="flex h-full min-w-0 flex-1">
          {main}
          {thread && !isLargeDesktop ? <AppShellOverlaySlot>{thread}</AppShellOverlaySlot> : null}
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
            className="relative z-20 min-w-0 overflow-visible!"
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
