import { Outlet } from "@tanstack/react-router";
import { useMediaQuery } from "foxact/use-media-query";
import { AppShellMainSlot, AppShellRoot, ResizableGroup, ResizablePanel } from "raft-ui/wip";

import { PlaygroundRail } from "./playground-rail.tsx";

export function PlaygroundPlainShell() {
  const isDesktop = useMediaQuery("(min-width: 768px)", false);

  return (
    <AppShellRoot className="h-full">
      <PlaygroundRail showBottomNavigation={false} />
      <ResizableGroup orientation="horizontal" className="h-auto min-w-0 flex-1 md:h-full">
        <ResizablePanel id="playground-main" minSize={isDesktop ? 360 : 0} className="min-w-0">
          <AppShellMainSlot className="flex h-full">
            <Outlet />
          </AppShellMainSlot>
        </ResizablePanel>
      </ResizableGroup>
    </AppShellRoot>
  );
}
