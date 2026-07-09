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
  PLAYGROUND_CHANNELS,
  isPlaygroundChannelId,
  type PlaygroundChannelId,
} from "#/playground/mock-data.ts";
import { PlaygroundMobileBar } from "#/playground/playground-mobile-bar.tsx";
import { PlaygroundRail } from "#/playground/playground-rail.tsx";
import { PlaygroundSidebar } from "#/playground/playground-sidebar.tsx";
import { PlaygroundThreadPanel } from "#/playground/playground-thread-panel.tsx";
import { PlaygroundToolbar } from "#/playground/playground-toolbar.tsx";

type PlaygroundTheme = { family: Theme; mode: "light" | "dark" };
type PlaygroundPresentation = "desktop" | "mobile";

export const Route = createFileRoute("/playground")({
  staticData: { standalone: true },
  // The layout owns thread-panel rendering, so the `thread` search param lives
  // here; child routes inherit it. Anything but `true` drops from the URL.
  validateSearch: (search): { thread?: true } => (search.thread === true ? { thread: true } : {}),
  component: PlaygroundLayout,
});

// The index route redirects to `$channelId`, so that leaf is always the active
// match under this layout — read its typed params directly.
const channelRouteApi = getRouteApi("/playground/$channelId");

function PlaygroundLayout() {
  const [theme, setTheme] = useState<PlaygroundTheme>({ family: "brutal", mode: "light" });
  const [presentation, setPresentation] = useState<PlaygroundPresentation>("desktop");
  const [railValue, setRailValue] = useState("chat");
  // Mobile is a drill-in flow, mirroring the source app: the channel list and the
  // conversation are separate full-screen views, never side by side.
  const [mobileScreen, setMobileScreen] = useState<"list" | "conversation">("list");

  const { channelId } = channelRouteApi.useParams();
  const { thread } = Route.useSearch();

  const activeChannelId: PlaygroundChannelId = isPlaygroundChannelId(channelId)
    ? channelId
    : DEFAULT_CHANNEL_ID;
  const activeChannel = PLAYGROUND_CHANNELS[activeChannelId];
  const threadOpen = thread && activeChannel.hasThread;

  return (
    <div className="h-dvh">
      <PreviewThemeScope family={theme.family} mode={theme.mode} className="h-full">
        {presentation === "mobile" ? (
          <AppShellRoot presentation="mobile" className="h-full">
            {mobileScreen === "conversation" ? (
              <AppShellMain className="flex h-full">
                <Outlet />
              </AppShellMain>
            ) : (
              <AppShellSidebar
                className="flex w-full flex-1 border-r-0 md:flex"
                // Tapping a channel link navigates and drills into its conversation
                // screen; non-navigation clicks (headers, dialogs) stay on the list.
                onClick={(event) => {
                  if (event.target instanceof Element && event.target.closest("a")) {
                    setMobileScreen("conversation");
                  }
                }}
              >
                <PlaygroundSidebar activeChannelId={activeChannelId} />
              </AppShellSidebar>
            )}
            <PlaygroundMobileBar
              value={railValue}
              onValueChange={(value) => {
                setRailValue(value);
                // The "Home" tab returns to the channel list, as in the source tab bar.
                if (value === "chat") setMobileScreen("list");
              }}
            />
          </AppShellRoot>
        ) : (
          <AppShellRoot className="h-full">
            <PlaygroundRail value={railValue} onValueChange={setRailValue} />
            <ChatSidebarResizeGroup orientation="horizontal" className="min-w-0 flex-1">
              <ChatSidebarResizePanel
                id="playground-sidebar"
                className="bg-layer-panel [[data-preview-theme=brutal]_&]:bg-brutal-cream"
                defaultSize={240}
                minSize={180}
                maxSize={320}
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
              {threadOpen ? (
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
                            <PlaygroundThreadPanel channel={activeChannel} />
                          </AppPanelStackContent>
                        </AppPanelStackItem>
                      </AppPanelStackRoot>
                    </AppShellPanelStack>
                  </ChatSidebarResizePanel>
                </>
              ) : null}
            </ChatSidebarResizeGroup>
          </AppShellRoot>
        )}
      </PreviewThemeScope>
      <PlaygroundToolbar
        theme={theme}
        onThemeChange={setTheme}
        presentation={presentation}
        onPresentationChange={setPresentation}
      />
    </div>
  );
}
