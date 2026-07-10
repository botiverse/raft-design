import { Outlet, createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useState } from "react";
import type { Theme } from "raft-ui";
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

import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import {
  DEFAULT_CHANNEL_ID,
  getPlaygroundChannel,
  getPlaygroundThread,
  isPlaygroundChannelId,
  isPlaygroundThreadId,
  type PlaygroundChannelId,
  type PlaygroundThreadId,
} from "#/playground/mock/index.ts";
import { PlaygroundRail } from "#/playground/playground-rail.tsx";
import { PlaygroundSidebar } from "#/playground/playground-sidebar.tsx";
import { PlaygroundThreadPanel } from "#/playground/playground-thread-panel.tsx";
import { PlaygroundToolbar } from "#/playground/playground-toolbar.tsx";

type PlaygroundTheme = { family: Theme; mode: "light" | "dark" };

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
  const [theme, setTheme] = useState<PlaygroundTheme>({ family: "elegant", mode: "light" });
  const [railValue, setRailValue] = useState("chat");

  const { channelId } = channelRouteApi.useParams();
  const { thread } = Route.useSearch();

  const activeChannelId: PlaygroundChannelId = isPlaygroundChannelId(channelId)
    ? channelId
    : DEFAULT_CHANNEL_ID;
  const activeChannel = getPlaygroundChannel(activeChannelId);
  const threadContext = thread ? getPlaygroundThread(thread) : undefined;
  const activeThread =
    threadContext?.channelId === activeChannel.id ? threadContext.thread : undefined;

  return (
    <div className="h-dvh">
      <PreviewThemeScope
        family={theme.family}
        mode={theme.mode}
        className="h-full"
        data-message-chrome="current"
      >
        <AppShellRoot className="h-full">
          <PlaygroundRail value={railValue} onValueChange={setRailValue} />
          <ChatSidebarResizeGroup orientation="horizontal" className="min-w-0 flex-1">
            <ChatSidebarResizePanel
              id="playground-sidebar"
              defaultSize={252}
              minSize={180}
              maxSize={368}
              groupResizeBehavior="preserve-pixel-size"
            >
              <AppShellSidebar resizable className="flex h-full md:flex">
                <PlaygroundSidebar activeChannelId={activeChannelId} />
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
                  <AppShellPanelStack className="flex h-full w-full lg:flex">
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
      </PreviewThemeScope>
      <PlaygroundToolbar theme={theme} onThemeChange={setTheme} />
    </div>
  );
}
