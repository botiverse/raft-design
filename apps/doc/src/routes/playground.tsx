import {
  Outlet,
  createFileRoute,
  useMatch,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useThemeFamily } from "raft-ui";
import {
  AppPanelStackContent,
  AppPanelStackItem,
  AppPanelStackRoot,
  AppShellMain,
  AppShellPanelStack,
  AppShellRoot,
  AppShellSidebar,
  ResizableGroup,
  ResizableHandle,
  ResizablePanel,
} from "raft-ui/wip";

import { PreviewThemeScope, usePreviewTheme } from "#/components/preview-theme.tsx";
import {
  DEFAULT_CHANNEL_ID,
  PLAYGROUND_LIVE_AGENT_ACTIVITY,
  getPlaygroundActor,
  getPlaygroundChannel,
  getPlaygroundThread,
  isPlaygroundChannelId,
  isPlaygroundThreadId,
  type PlaygroundChannelId,
  type PlaygroundChannelRecord,
  type PlaygroundTask,
  type PlaygroundThread,
  type PlaygroundThreadId,
} from "#/playground/mock/index.ts";
import { PlaygroundRail } from "#/playground/playground-rail.tsx";
import {
  PlaygroundMobilePreview,
  usePlaygroundEmbeddedPreview,
} from "#/playground/playground-mobile-preview.tsx";
import {
  PlaygroundRailViewPanel,
  PlaygroundRailViewSidebar,
} from "#/playground/playground-rail-views.tsx";
import { PlaygroundSidebar } from "#/playground/playground-sidebar.tsx";
import {
  PlaygroundNavigationProvider,
  type PlaygroundRailView,
  usePlaygroundNavigation,
} from "#/playground/playground-navigation-state.tsx";
import { PlaygroundThreadPanel } from "#/playground/playground-thread-panel.tsx";
import { PlaygroundTasksPanel } from "#/playground/playground-tasks-panel.tsx";
import { PlaygroundShellStateProvider } from "#/playground/playground-shell-state.tsx";
import {
  PlaygroundTaskStateProvider,
  usePlaygroundTaskState,
} from "#/playground/playground-task-state.tsx";
import { PlaygroundToolbar } from "#/playground/playground-toolbar.tsx";

type PlaygroundSearch = {
  detail?: string;
  from?: "tasks";
  thread?: PlaygroundThreadId;
};

export const Route = createFileRoute("/playground")({
  staticData: { standalone: true },
  // The layout owns thread-panel rendering; child routes inherit `thread`.
  validateSearch: (search): PlaygroundSearch => {
    const thread =
      typeof search.thread === "string" && isPlaygroundThreadId(search.thread)
        ? search.thread
        : undefined;
    return {
      ...(typeof search.detail === "string" && search.detail.length > 0
        ? { detail: search.detail }
        : {}),
      ...(thread ? { thread } : {}),
      ...(thread && search.from === "tasks" ? { from: "tasks" as const } : {}),
    };
  },
  component: PlaygroundLayout,
});

function PlaygroundLayout() {
  const { theme, mode, setTheme } = usePreviewTheme();
  const navigate = useNavigate();
  const location = useRouterState({ select: (state) => state.location });
  const pathname = location.pathname;
  const [mobilePreview, setMobilePreview] = useState(false);
  const embeddedPreview = usePlaygroundEmbeddedPreview(theme, mode);

  const channelMatch = useMatch({ from: "/playground/$channelId", shouldThrow: false });
  const { detail, from, thread } = Route.useSearch();
  const railView = getRailView(pathname);
  const selectRailView = useCallback(
    (view: PlaygroundRailView) => {
      void navigate({ to: playgroundRailPaths[view], search: {} });
    },
    [navigate],
  );
  const selectRailDetail = useCallback(
    (id?: string) => {
      void navigate({
        to: ".",
        search: (current) => ({
          ...current,
          detail: id,
        }),
      });
    },
    [navigate],
  );

  const channelId = channelMatch?.params.channelId;
  const activeChannelId: PlaygroundChannelId =
    channelId !== undefined && isPlaygroundChannelId(channelId) ? channelId : DEFAULT_CHANNEL_ID;
  const activeChannel = getPlaygroundChannel(activeChannelId);
  const isRootRoute = channelMatch === undefined;
  const workspace = (
    <PreviewThemeScope
      family={embeddedPreview.theme}
      mode={embeddedPreview.mode}
      className="h-full"
    >
      <PlaygroundNavigationProvider
        railView={railView}
        railDetailId={detail}
        onRailViewChange={selectRailView}
        onRailDetailChange={selectRailDetail}
      >
        <PlaygroundShellStateProvider>
          <PlaygroundTaskStateProvider>
            <PlaygroundWorkspace
              activeChannel={activeChannel}
              isRootRoute={isRootRoute}
              threadSource={from}
              threadId={isRootRoute ? undefined : thread}
            />
          </PlaygroundTaskStateProvider>
        </PlaygroundShellStateProvider>
      </PlaygroundNavigationProvider>
    </PreviewThemeScope>
  );

  return (
    <div className="h-dvh">
      {mobilePreview && !embeddedPreview.embedded ? (
        <PreviewThemeScope className="h-full">
          <PlaygroundMobilePreview src={location.href} theme={theme} mode={mode} />
        </PreviewThemeScope>
      ) : (
        workspace
      )}
      {embeddedPreview.embedded ? null : (
        <PlaygroundToolbar
          theme={theme}
          mode={mode}
          mobile={mobilePreview}
          onThemeChange={setTheme}
          onMobileChange={setMobilePreview}
        />
      )}
    </div>
  );
}

function PlaygroundWorkspace({
  activeChannel,
  isRootRoute,
  threadSource,
  threadId,
}: {
  activeChannel: PlaygroundChannelRecord;
  isRootRoute: boolean;
  threadSource?: "tasks";
  threadId?: PlaygroundThreadId;
}) {
  const { tasks } = usePlaygroundTaskState();
  const theme = useThemeFamily();
  const { railDetailId, railView } = usePlaygroundNavigation();
  const threadContext = threadId ? getPlaygroundThread(threadId) : undefined;
  const task = threadId ? tasks.find((item) => item.id === threadId) : undefined;
  const activeThread =
    threadContext?.channelId === activeChannel.id
      ? threadContext.thread
      : task?.channelId === activeChannel.id
        ? getTaskThread(task)
        : undefined;
  const conversationView = railView === "chat" || railView === "tasks";
  const liveAgentActor = getPlaygroundActor(PLAYGROUND_LIVE_AGENT_ACTIVITY.actorId);
  const liveAgentActivity =
    railView === "chat"
      ? {
          activity: PLAYGROUND_LIVE_AGENT_ACTIVITY.activity,
          agentAvatarSrc: liveAgentActor.avatarSrc,
          text: PLAYGROUND_LIVE_AGENT_ACTIVITY.text,
        }
      : null;
  const auxiliaryView =
    railView === "members" || railView === "computers" || railView === "settings" ? railView : null;
  const standaloneView =
    railView === "search" ||
    railView === "activity" ||
    railView === "saved" ||
    railView === "members" ||
    railView === "computers" ||
    railView === "settings"
      ? railView
      : null;
  const auxiliaryDetailVisible = auxiliaryView !== null && railDetailId !== undefined;
  const showSidebar = conversationView || auxiliaryView !== null;
  const showMain =
    (!isRootRoute && conversationView) ||
    railView === "tasks" ||
    railView === "search" ||
    railView === "activity" ||
    railView === "saved" ||
    auxiliaryDetailVisible;
  const mobileTabRoot =
    isRootRoute &&
    !auxiliaryDetailVisible &&
    (railView === "chat" ||
      railView === "tasks" ||
      railView === "members" ||
      railView === "settings");

  return (
    <AppShellRoot
      className={[
        "h-full max-md:flex-col max-md:pt-[env(safe-area-inset-top,0px)]",
        mobileTabRoot
          ? "max-md:[[data-theme=brutal]_&]:bg-soft-signal"
          : "max-md:[[data-theme=brutal]_&]:bg-white",
      ].join(" ")}
    >
      <PlaygroundRail showBottomNavigation={mobileTabRoot} />
      <ResizableGroup
        orientation="horizontal"
        className="h-auto min-w-0 flex-1 md:h-full max-md:[&>[data-slot=resizable-panel]]:!hidden max-md:[&>[data-slot=resizable-panel]:last-child]:!flex max-md:[&>[data-slot=resizable-panel]:last-child]:!basis-0 max-md:[&>[data-slot=resizable-panel]:last-child]:!grow"
      >
        {showSidebar ? (
          <>
            <ResizablePanel
              key={theme}
              id={`playground-sidebar-${theme}`}
              defaultSize={theme === "brutal" ? 240 : 252}
              minSize={180}
              maxSize={368}
              groupResizeBehavior="preserve-pixel-size"
              className={
                theme === "brutal"
                  ? "has-[>[data-slot=app-shell-sidebar]]:bg-brutal-cream"
                  : "has-[>[data-slot=app-shell-sidebar]]:bg-layer-page"
              }
            >
              <AppShellSidebar className="relative h-full min-w-0 w-auto flex-1 shrink max-md:flex">
                {conversationView ? (
                  <PlaygroundSidebar
                    activeChannelId={activeChannel.id}
                    liveAgentActivity={liveAgentActivity}
                    title={railView === "tasks" ? "Tasks" : "Chat"}
                  />
                ) : auxiliaryView ? (
                  <PlaygroundRailViewSidebar view={auxiliaryView} />
                ) : null}
              </AppShellSidebar>
            </ResizablePanel>
            {showMain ? <ResizableHandle className="hidden md:flex" /> : null}
          </>
        ) : null}
        {showMain ? (
          <ResizablePanel id="playground-main" minSize={360} className="min-w-0">
            <AppShellMain className="flex h-full">
              {isRootRoute && railView === "tasks" ? (
                <PlaygroundTasksPanel />
              ) : standaloneView ? (
                <PlaygroundRailViewPanel view={standaloneView} />
              ) : (
                <Outlet />
              )}
            </AppShellMain>
          </ResizablePanel>
        ) : null}
        {conversationView && activeThread ? (
          <>
            <ResizableHandle className="hidden md:flex" />
            <ResizablePanel
              id="playground-thread"
              defaultSize={400}
              minSize={320}
              maxSize={560}
              groupResizeBehavior="preserve-pixel-size"
              className="min-w-0"
            >
              <AppShellPanelStack className="h-full w-full max-md:flex">
                <AppPanelStackRoot className="w-full">
                  <AppPanelStackItem className="w-full">
                    <AppPanelStackContent>
                      <PlaygroundThreadPanel
                        key={activeThread.parent.id}
                        backToTasks={threadSource === "tasks"}
                        channel={activeChannel}
                        thread={activeThread}
                      />
                    </AppPanelStackContent>
                  </AppPanelStackItem>
                </AppPanelStackRoot>
              </AppShellPanelStack>
            </ResizablePanel>
          </>
        ) : null}
      </ResizableGroup>
    </AppShellRoot>
  );
}

const playgroundRailPaths = {
  search: "/playground/search",
  chat: "/playground",
  activity: "/playground/activity",
  saved: "/playground/saved",
  tasks: "/playground/tasks",
  members: "/playground/members",
  computers: "/playground/computers",
  settings: "/playground/settings",
} as const satisfies Record<PlaygroundRailView, string>;

function getRailView(pathname: string): PlaygroundRailView {
  const segment = pathname.split("/").filter(Boolean)[1];
  return segment && segment in playgroundRailPaths ? (segment as PlaygroundRailView) : "chat";
}

function getTaskThread(task: PlaygroundTask): PlaygroundThread {
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
