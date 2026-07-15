import { Outlet, getRouteApi } from "@tanstack/react-router";
import { useMediaQuery } from "foxact/use-media-query";
import { useThemeFamily } from "raft-ui";
import { cn } from "raft-ui/cn";
import {
  AppPanelStackContent,
  AppPanelStackItem,
  AppPanelStackRoot,
  AppShellMainSlot,
  AppShellPanelStackSlot,
  AppShellRoot,
  AppShellSidebarSlot,
  ResizableGroup,
  ResizableHandle,
  ResizablePanel,
} from "raft-ui/wip";

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

const playgroundRoute = getRouteApi("/playground");
const playgroundChannelRoute = getRouteApi("/playground/_channel/$channelId");

export function PlaygroundChannelShell() {
  const { channelId } = playgroundChannelRoute.useParams();
  const { from, panel, thread } = playgroundRoute.useSearch();
  const { tasks } = usePlaygroundTaskState();
  const theme = useThemeFamily();
  const isDesktop = useMediaQuery("(min-width: 768px)", false);

  if (!isPlaygroundChannelId(channelId)) return null;

  const channel = getPlaygroundChannel(channelId);
  const threadContext = thread ? getPlaygroundThread(thread) : undefined;
  const task = thread ? tasks.find((item) => item.id === thread) : undefined;
  const activeThread =
    threadContext?.channelId === channel.id
      ? threadContext.thread
      : task?.channelId === channel.id
        ? getPlaygroundTaskThread(task)
        : undefined;
  const mobileListPanel = panel === "list" && !isDesktop;
  const mobilePanel = activeThread ? "thread" : mobileListPanel ? "sidebar" : "main";
  const renderSidebarPanel = isDesktop || mobilePanel === "sidebar";
  const renderMainPanel = isDesktop || mobilePanel === "main";
  const renderThreadPanel = Boolean(activeThread) && (isDesktop || mobilePanel === "thread");
  const liveAgentActor = getPlaygroundActor(PLAYGROUND_LIVE_AGENT_ACTIVITY.actorId);

  return (
    <AppShellRoot
      className={cn(
        "h-full",
        theme === "brutal" && (mobileListPanel ? "max-md:bg-soft-signal" : "max-md:bg-white"),
      )}
    >
      <PlaygroundRail showBottomNavigation={mobileListPanel} />
      <ResizableGroup orientation="horizontal" className="h-auto min-w-0 flex-1 md:h-full">
        {renderSidebarPanel ? (
          <>
            <ResizablePanel
              key={theme}
              id={`playground-sidebar-${theme}`}
              defaultSize={theme === "brutal" ? 240 : 252}
              minSize={180}
              maxSize={368}
              groupResizeBehavior="preserve-pixel-size"
            >
              <AppShellSidebarSlot className="relative flex h-full min-w-0 w-auto flex-1 shrink">
                <PlaygroundSidebar
                  activeChannelId={channel.id}
                  liveAgentActivity={{
                    activity: PLAYGROUND_LIVE_AGENT_ACTIVITY.activity,
                    agentAvatarSrc: liveAgentActor.avatarSrc,
                    text: PLAYGROUND_LIVE_AGENT_ACTIVITY.text,
                  }}
                  title="Chat"
                />
              </AppShellSidebarSlot>
            </ResizablePanel>
            {renderMainPanel ? <ResizableHandle className="hidden md:flex" /> : null}
          </>
        ) : null}
        {renderMainPanel ? (
          <ResizablePanel id="playground-main" minSize={isDesktop ? 360 : 0} className="min-w-0">
            <AppShellMainSlot className="flex h-full">
              <Outlet />
            </AppShellMainSlot>
          </ResizablePanel>
        ) : null}
        {renderThreadPanel && activeThread ? (
          <>
            {isDesktop ? <ResizableHandle className="hidden md:flex" /> : null}
            <ResizablePanel
              id="playground-thread"
              defaultSize={400}
              minSize={isDesktop ? 320 : 0}
              maxSize={560}
              groupResizeBehavior="preserve-pixel-size"
              className="min-w-0"
            >
              <AppShellPanelStackSlot className="flex h-full w-full">
                <AppPanelStackRoot className="w-full">
                  <AppPanelStackItem className="w-full">
                    <AppPanelStackContent>
                      <PlaygroundThreadPanel
                        key={activeThread.parent.id}
                        backToTasks={from === "tasks"}
                        channel={channel}
                        thread={activeThread}
                      />
                    </AppPanelStackContent>
                  </AppPanelStackItem>
                </AppPanelStackRoot>
              </AppShellPanelStackSlot>
            </ResizablePanel>
          </>
        ) : null}
      </ResizableGroup>
    </AppShellRoot>
  );
}

function getPlaygroundTaskThread(task: PlaygroundTask): PlaygroundThread {
  return {
    parent: {
      id: task.id,
      authorId: task.creatorActorId,
      time: `Task #${task.number}`,
      body: task.description ? `${task.title}\n${task.description}` : task.title,
    },
    replies: [],
  };
}
