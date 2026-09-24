import { Outlet, useMatch } from "@tanstack/react-router";
import { AppShellRoot, useThemeFamily } from "raft-ui";
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
import { PlaygroundChatLayout } from "./playground-chat-layout.tsx";
import { usePlaygroundDesktop, usePlaygroundLargeDesktop } from "./use-playground-desktop.ts";

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
  const mobileListPanel = !savedMatch && (channel === null || (panel === "list" && !sidePanel));
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
