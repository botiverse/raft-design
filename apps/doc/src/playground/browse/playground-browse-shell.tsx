import { Outlet } from "@tanstack/react-router";
import { useMediaQuery } from "foxact/use-media-query";
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

import { PlaygroundRail } from "../rail/playground-rail.tsx";
import { PlaygroundRailViewSidebar } from "./playground-rail-views.tsx";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";

export function PlaygroundBrowseShell() {
  const theme = useThemeFamily();
  const isDesktop = useMediaQuery("(min-width: 768px)", false);
  const { railDetailId, railView } = usePlaygroundNavigation();
  const view = railView === "members" || railView === "computers" ? railView : null;
  const sidebarDefaultSize = theme === "brutal" ? 240 : 252;

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
            "h-full w-full bg-transparent",
            showBottomNavigation && "max-md:h-auto max-md:min-h-0",
          )}
        >
          {showSidebar ? (
            <div
              className={cn(
                "relative flex h-full min-h-0 w-full flex-1",
                theme === "elegant" &&
                  showBottomNavigation &&
                  "max-md:pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))]",
              )}
            >
              {sidebar}
            </div>
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
              key={theme}
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
            {showMain ? <ResizableHandle className="hidden md:flex" /> : null}
          </>
        ) : null}
        {showMain ? (
          <ResizablePanel id="playground-main" minSize={isDesktop ? 360 : 0} className="relative">
            <AppShellMainSlot className="flex h-full min-w-0 flex-1">
              <Outlet />
            </AppShellMainSlot>
          </ResizablePanel>
        ) : null}
      </ResizableGroup>
    </AppShellRoot>
  );
}
