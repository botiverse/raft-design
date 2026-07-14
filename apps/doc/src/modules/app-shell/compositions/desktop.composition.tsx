import type { ReactNode } from "react";
import {
  AppShellMain,
  AppShellPanelStack,
  AppShellRail,
  AppShellRoot,
  AppShellSidebar,
} from "raft-ui/wip";

function ShellRegion({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div
      className={`flex h-full min-h-0 w-full min-w-0 items-center justify-center px-2 text-center font-mono text-xs font-semibold uppercase tracking-wide ${className}`}
    >
      {children}
    </div>
  );
}

export function AppShellDesktopComposition() {
  return (
    <div className="w-full overflow-x-auto">
      <AppShellRoot className="h-[420px] min-w-[860px]">
        <AppShellRail className="flex md:flex">
          <ShellRegion className="bg-primary-300 text-primary-950">Rail</ShellRegion>
        </AppShellRail>

        <AppShellSidebar visibility="always">
          <ShellRegion className="bg-accent-200 text-accent-950">Sidebar</ShellRegion>
        </AppShellSidebar>

        <AppShellMain>
          <ShellRegion className="bg-primary-100 text-primary-950">Main</ShellRegion>
        </AppShellMain>

        <AppShellPanelStack visibility="always">
          <div className="h-full w-56">
            <ShellRegion className="bg-secondary-200 text-secondary-950">Panel stack</ShellRegion>
          </div>
        </AppShellPanelStack>
      </AppShellRoot>
    </div>
  );
}
