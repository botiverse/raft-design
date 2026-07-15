import { Outlet } from "@tanstack/react-router";
import { useMediaQuery } from "foxact/use-media-query";
import { useThemeFamily } from "raft-ui";
import { cn } from "raft-ui/cn";
import {
  AppShellMainSlot,
  AppShellRoot,
  AppShellSidebarSlot,
  ResizableGroup,
  ResizableHandle,
  ResizablePanel,
} from "raft-ui/wip";

import { PlaygroundRail } from "./playground-rail.tsx";
import { PlaygroundRailViewSidebar } from "./playground-rail-views.tsx";
import { usePlaygroundNavigation } from "./playground-navigation-state.tsx";

export function PlaygroundBrowseShell() {
  const theme = useThemeFamily();
  const isDesktop = useMediaQuery("(min-width: 768px)", false);
  const { railDetailId, railView } = usePlaygroundNavigation();
  const view = railView === "members" || railView === "computers" ? railView : null;

  if (!view) return null;

  const showMain = isDesktop || railDetailId !== undefined;
  const showSidebar = isDesktop || !showMain;
  const showBottomNavigation = view === "members" && !showMain;

  const sidebar = (
    <AppShellSidebarSlot
      className={cn(
        "relative flex h-full min-w-0",
        isDesktop ? "w-auto flex-1 shrink" : "!w-full !flex-none !shrink-0",
        theme === "elegant" &&
          showBottomNavigation &&
          "max-md:pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))]",
      )}
    >
      <PlaygroundRailViewSidebar view={view} />
    </AppShellSidebarSlot>
  );

  const main = (
    <AppShellMainSlot className="flex h-full">
      <Outlet />
    </AppShellMainSlot>
  );

  if (!isDesktop) {
    return (
      <AppShellRoot className="h-full">
        <PlaygroundRail showBottomNavigation={showBottomNavigation} />
        <div className="flex h-full min-h-0 min-w-0 flex-1">{showSidebar ? sidebar : main}</div>
      </AppShellRoot>
    );
  }

  return (
    <AppShellRoot className="h-full">
      <PlaygroundRail showBottomNavigation={showBottomNavigation} />
      <ResizableGroup orientation="horizontal" className="h-auto min-w-0 flex-1 md:h-full">
        {showSidebar ? (
          <>
            <ResizablePanel
              key={theme}
              id={`playground-sidebar-${theme}`}
              defaultSize={theme === "brutal" ? 240 : 252}
              minSize={180}
              maxSize={368}
              groupResizeBehavior="preserve-pixel-size"
            >
              {sidebar}
            </ResizablePanel>
            {showMain ? <ResizableHandle className="hidden md:flex" /> : null}
          </>
        ) : null}
        {showMain ? (
          <ResizablePanel id="playground-main" minSize={isDesktop ? 360 : 0} className="min-w-0">
            {main}
          </ResizablePanel>
        ) : null}
      </ResizableGroup>
    </AppShellRoot>
  );
}
