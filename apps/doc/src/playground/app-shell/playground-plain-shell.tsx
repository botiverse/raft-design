import { Outlet } from "@tanstack/react-router";
import { AppShellMainSlot, AppShellRoot } from "raft-ui";

import { PlaygroundRail } from "../rail/playground-rail.tsx";

export function PlaygroundPlainShell() {
  return (
    <AppShellRoot className="h-full max-md:h-dvh max-md:overflow-hidden">
      <PlaygroundRail showBottomNavigation />
      <AppShellMainSlot className="flex h-full min-h-0 max-md:pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))]">
        <Outlet />
      </AppShellMainSlot>
    </AppShellRoot>
  );
}
