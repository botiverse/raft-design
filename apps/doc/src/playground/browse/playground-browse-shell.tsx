import { Outlet } from "@tanstack/react-router";
import { useMediaQuery } from "foxact/use-media-query";
import {
  AppShellMainSlot,
  AppShellRoot,
  AppShellSidebarSlot,
  ResizableGroup,
  ResizableHandle,
  ResizablePanel,
} from "raft-ui";
import { cn } from "raft-ui/cn";

import { PlaygroundRail } from "../rail/playground-rail.tsx";
import { PlaygroundRailViewSidebar } from "./playground-rail-views.tsx";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";

export function PlaygroundBrowseShell() {
  const isDesktop = useMediaQuery("(min-width: 768px)", false);
  const { railDetailId, railView } = usePlaygroundNavigation();
  const view = railView === "members" || railView === "computers" ? railView : null;

  if (!view) return null;

  const showMain = isDesktop || railDetailId !== undefined;
  const showSidebar = isDesktop || !showMain;
  const showBottomNavigation = view === "members" && !showMain;

  const sidebar = <PlaygroundRailViewSidebar view={view} />;

  if (!isDesktop) {
    return (
      <AppShellRoot
        className={cn(
          "h-full",
          showBottomNavigation && "max-md:h-auto max-md:min-h-dvh max-md:overflow-visible",
        )}
      >
        <PlaygroundRail showBottomNavigation={showBottomNavigation} />
        <AppShellMainSlot
          className={cn(
            "size-full  bg-transparent",
            showBottomNavigation && "max-md:h-auto max-md:min-h-0",
          )}
        >
          {showSidebar ? (
            <div className="relative flex size-full min-h-0  flex-1">{sidebar}</div>
          ) : (
            <Outlet />
          )}
        </AppShellMainSlot>
      </AppShellRoot>
    );
  }

  return (
    <AppShellRoot sidebarCollapsible className="h-full">
      <PlaygroundRail showBottomNavigation={showBottomNavigation} />
      <ResizableGroup orientation="horizontal" className="h-auto min-w-0 flex-1 md:h-full">
        {showSidebar ? (
          <>
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
            {showMain ? <ResizableHandle className="hidden md:flex" /> : null}
          </>
        ) : null}
        {showMain ? (
          <ResizablePanel
            id="playground-main"
            minSize={isDesktop ? 360 : 0}
            className="relative overflow-visible!"
          >
            <AppShellMainSlot className="flex h-full min-w-0 flex-1">
              <Outlet />
            </AppShellMainSlot>
          </ResizablePanel>
        ) : null}
      </ResizableGroup>
    </AppShellRoot>
  );
}
