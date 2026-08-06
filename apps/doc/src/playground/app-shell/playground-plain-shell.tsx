import { Outlet, useLocation } from "@tanstack/react-router";
import { AppShellMainSlot, AppShellRoot } from "raft-ui";

import { PlaygroundRail } from "../rail/playground-rail.tsx";

export function PlaygroundPlainShell() {
  const pathname = useLocation().pathname;
  const ownsAppShellSlots =
    pathname === "/playground/activity" || pathname === "/playground/search";

  return (
    <AppShellRoot className="h-full max-md:h-dvh max-md:overflow-hidden">
      <PlaygroundRail showBottomNavigation />
      {ownsAppShellSlots ? (
        <Outlet />
      ) : (
        <AppShellMainSlot className="flex h-full min-h-0">
          <Outlet />
        </AppShellMainSlot>
      )}
    </AppShellRoot>
  );
}
