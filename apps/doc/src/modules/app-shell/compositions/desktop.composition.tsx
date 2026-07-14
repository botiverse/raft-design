import type { ReactNode } from "react";
import {
  AppShellMainSlot,
  AppShellPanelStackSlot,
  AppShellRailSlot,
  AppShellRoot,
  AppShellSidebarSlot,
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
        <AppShellRailSlot className="flex md:flex">
          <ShellRegion className="bg-primary-300 text-primary-950">Rail</ShellRegion>
        </AppShellRailSlot>

        <AppShellSidebarSlot className="flex">
          <ShellRegion className="bg-accent-200 text-accent-950">Sidebar</ShellRegion>
        </AppShellSidebarSlot>

        <AppShellMainSlot>
          <ShellRegion className="bg-primary-100 text-primary-950">Main</ShellRegion>
        </AppShellMainSlot>

        <AppShellPanelStackSlot className="flex">
          <div className="h-full w-56">
            <ShellRegion className="bg-secondary-200 text-secondary-950">Panel stack</ShellRegion>
          </div>
        </AppShellPanelStackSlot>
      </AppShellRoot>
    </div>
  );
}
