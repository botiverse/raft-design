import { Outlet } from "@tanstack/react-router";
import { useMediaQuery } from "foxact/use-media-query";
import {
  AppShellMainSlot,
  AppShellRoot,
  ResizableGroup,
  ResizableHandle,
  ResizablePanel,
  useThemeFamily,
} from "raft-ui";
import { cn } from "raft-ui/cn";

import { PlaygroundRail } from "../rail/playground-rail.tsx";
import { PlaygroundRailViewSidebar } from "./playground-rail-views.tsx";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";
import { usePlaygroundShellState } from "../app-shell/use-playground-shell-state.ts";
import { useSidebarPanelLayout } from "../app-shell/use-sidebar-panel-layout.ts";
import { PlaygroundSidebarPresence } from "../app-shell/playground-sidebar-presence.tsx";

export function PlaygroundBrowseShell() {
  const theme = useThemeFamily();
  const isDesktop = useMediaQuery("(min-width: 768px)", false);
  const { railDetailId, railView } = usePlaygroundNavigation();
  const { sidebarCollapsed } = usePlaygroundShellState();
  const view = railView === "members" || railView === "computers" ? railView : null;
  const sidebarPanelRef = useSidebarPanelLayout({
    active: isDesktop,
    collapsed: sidebarCollapsed,
  });

  if (!view) return null;

  const showMain = isDesktop || railDetailId !== undefined;
  const showSidebar = isDesktop || !showMain;
  const showBottomNavigation = view === "members" && !showMain;

  const sidebar = <PlaygroundRailViewSidebar view={view} />;

  const main = (
    <AppShellMainSlot className="flex h-full">
      <Outlet />
    </AppShellMainSlot>
  );

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
    <AppShellRoot className="h-full">
      <PlaygroundRail showBottomNavigation={showBottomNavigation} />
      <ResizableGroup
        orientation="horizontal"
        className="h-auto min-w-0 flex-1 [&>[data-panel]]:transition-[flex] [&>[data-panel]]:duration-[220ms] [&>[data-panel]]:ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:[&>[data-panel]]:transition-none md:h-full"
      >
        {showSidebar ? (
          <>
            <ResizablePanel
              key={theme}
              id={`playground-sidebar-${theme}`}
              defaultSize={theme === "brutal" ? 240 : 252}
              minSize={180}
              maxSize={368}
              collapsible
              collapsedSize={0}
              groupResizeBehavior="preserve-pixel-size"
              panelRef={sidebarPanelRef}
              className="relative min-w-0"
            >
              <PlaygroundSidebarPresence collapsed={sidebarCollapsed}>
                {sidebar}
              </PlaygroundSidebarPresence>
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
