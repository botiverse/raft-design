import { Outlet, createFileRoute, getRouteApi } from "@tanstack/react-router";
import {
  AppPanelStackContent,
  AppPanelStackItem,
  AppPanelStackRoot,
  AppShellMain,
  AppShellPanelStack,
  AppShellRoot,
  AppShellSidebar,
  ChatSidebarResizeGroup,
  ChatSidebarResizeHandle,
  ChatSidebarResizePanel,
} from "raft-ui/wip";

import { PreviewThemeScope, usePreviewTheme } from "#/components/preview-theme.tsx";
import {
  DEFAULT_CHANNEL_ID,
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
import { PlaygroundSidebar } from "#/playground/playground-sidebar.tsx";
import { PlaygroundThreadPanel } from "#/playground/playground-thread-panel.tsx";
import {
  PlaygroundTaskStateProvider,
  usePlaygroundTaskState,
} from "#/playground/playground-task-state.tsx";
import { PlaygroundToolbar } from "#/playground/playground-toolbar.tsx";

type PlaygroundSearch = {
  thread?: PlaygroundThreadId;
};

export const Route = createFileRoute("/playground")({
  staticData: { standalone: true },
  // The layout owns thread-panel rendering; child routes inherit `thread`.
  validateSearch: (search): PlaygroundSearch =>
    typeof search.thread === "string" && isPlaygroundThreadId(search.thread)
      ? { thread: search.thread }
      : {},
  component: PlaygroundLayout,
});

// The index route redirects to `$channelId`, so that leaf is always the active
// match under this layout — read its typed params directly.
const channelRouteApi = getRouteApi("/playground/$channelId");

function PlaygroundLayout() {
  const { theme, mode, setTheme } = usePreviewTheme();

  const { channelId } = channelRouteApi.useParams();
  const { thread } = Route.useSearch();

  const activeChannelId: PlaygroundChannelId = isPlaygroundChannelId(channelId)
    ? channelId
    : DEFAULT_CHANNEL_ID;
  const activeChannel = getPlaygroundChannel(activeChannelId);

  return (
    <div className="h-dvh">
      <PreviewThemeScope className="h-full">
        <PlaygroundTaskStateProvider>
          <PlaygroundWorkspace activeChannel={activeChannel} threadId={thread} />
        </PlaygroundTaskStateProvider>
      </PreviewThemeScope>
      <PlaygroundToolbar theme={theme} mode={mode} onThemeChange={setTheme} />
    </div>
  );
}

function PlaygroundWorkspace({
  activeChannel,
  threadId,
}: {
  activeChannel: PlaygroundChannelRecord;
  threadId?: PlaygroundThreadId;
}) {
  const { tasks } = usePlaygroundTaskState();
  const threadContext = threadId ? getPlaygroundThread(threadId) : undefined;
  const task = threadId ? tasks.find((item) => item.id === threadId) : undefined;
  const activeThread =
    threadContext?.channelId === activeChannel.id
      ? threadContext.thread
      : task?.channelId === activeChannel.id
        ? getTaskThread(task)
        : undefined;

  return (
    <AppShellRoot className="h-full">
      <PlaygroundRail />
      <ChatSidebarResizeGroup orientation="horizontal" className="min-w-0 flex-1">
        <ChatSidebarResizePanel
          id="playground-sidebar"
          defaultSize={252}
          minSize={180}
          maxSize={368}
          groupResizeBehavior="preserve-pixel-size"
        >
          <AppShellSidebar resizable className="h-full">
            <PlaygroundSidebar activeChannelId={activeChannel.id} />
          </AppShellSidebar>
        </ChatSidebarResizePanel>
        <ChatSidebarResizeHandle />
        <ChatSidebarResizePanel id="playground-main" minSize={360} className="min-w-0">
          <AppShellMain className="flex h-full">
            <Outlet />
          </AppShellMain>
        </ChatSidebarResizePanel>
        {activeThread ? (
          <>
            <ChatSidebarResizeHandle />
            <ChatSidebarResizePanel
              id="playground-thread"
              defaultSize={400}
              minSize={320}
              maxSize={560}
              groupResizeBehavior="preserve-pixel-size"
              className="min-w-0"
            >
              <AppShellPanelStack className="h-full w-full">
                <AppPanelStackRoot className="w-full">
                  <AppPanelStackItem className="w-full">
                    <AppPanelStackContent>
                      <PlaygroundThreadPanel
                        key={activeThread.parent.id}
                        channel={activeChannel}
                        thread={activeThread}
                      />
                    </AppPanelStackContent>
                  </AppPanelStackItem>
                </AppPanelStackRoot>
              </AppShellPanelStack>
            </ChatSidebarResizePanel>
          </>
        ) : null}
      </ChatSidebarResizeGroup>
    </AppShellRoot>
  );
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
