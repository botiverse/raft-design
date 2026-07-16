import type { ReactNode } from "react";
import { useThemeFamily } from "raft-ui";
import { cn } from "raft-ui/cn";
import { AppShellMainSlot, AppShellRailSlot, AppShellRoot, AppShellSidebarSlot } from "raft-ui/wip";

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
  const theme = useThemeFamily();

  return (
    <div className="w-full overflow-x-auto">
      <AppShellRoot className="h-[420px] min-w-[860px]">
        <AppShellRailSlot className="flex md:flex">
          <ShellRegion className="bg-primary-300 text-primary-950">Rail</ShellRegion>
        </AppShellRailSlot>

        <AppShellSidebarSlot className={cn("flex", theme === "brutal" ? "w-60" : "w-[252px]")}>
          <ShellRegion className="bg-accent-200 text-accent-950">Sidebar</ShellRegion>
        </AppShellSidebarSlot>

        <AppShellMainSlot>
          <ShellRegion className="bg-primary-100 text-primary-950">Main</ShellRegion>
        </AppShellMainSlot>
      </AppShellRoot>
    </div>
  );
}
