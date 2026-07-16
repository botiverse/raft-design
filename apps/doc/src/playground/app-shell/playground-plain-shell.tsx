import { Outlet } from "@tanstack/react-router";
import { AppShellMainSlot, AppShellRoot } from "raft-ui/wip";

import { PlaygroundRail } from "../rail/playground-rail.tsx";

export function PlaygroundPlainShell() {
  return (
    <AppShellRoot className="h-full">
      <PlaygroundRail showBottomNavigation={false} />
      <AppShellMainSlot className="flex h-full">
        <Outlet />
      </AppShellMainSlot>
    </AppShellRoot>
  );
}
