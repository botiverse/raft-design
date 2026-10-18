import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { ReactNode } from "react";
import {
  AppShellMainSlot,
  AppShellRailSlot,
  AppShellRoot,
  AppShellSidebarSlot,
  AppShellSidebarTrigger,
  ResizableGroup,
  ResizableHandle,
  ResizablePanel,
} from "raft-ui";
import { cn } from "raft-ui/cn";

function ShellRegion({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div
      className={cn(
        "flex size-full min-h-0  min-w-0 items-center justify-center px-2 text-center font-mono text-xs font-semibold uppercase tracking-wide",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SidebarTrigger() {
  return (
    <AppShellSidebarTrigger>
      <PanelLeftClose className="group-data-[state=collapsed]/app-shell-sidebar-trigger:hidden" />
      <PanelLeftOpen className="hidden group-data-[state=collapsed]/app-shell-sidebar-trigger:block" />
    </AppShellSidebarTrigger>
  );
}

export function AppShellCollapsibleSidebarComposition() {
  return (
    <div className="w-full overflow-x-auto">
      <AppShellRoot sidebarCollapsible className="h-[420px] min-w-[860px]">
        <AppShellRailSlot className="flex md:flex">
          <ShellRegion className="w-16 bg-brand-300 text-brand-950">Rail</ShellRegion>
        </AppShellRailSlot>

        <ResizableGroup orientation="horizontal" className="h-full min-w-0 flex-1">
          <ResizablePanel
            id="app-shell-collapsible-sidebar"
            defaultSize={252}
            minSize={180}
            maxSize={368}
            groupResizeBehavior="preserve-pixel-size"
            className="relative min-w-0"
          >
            <AppShellSidebarSlot className="relative flex h-full w-auto min-w-0 flex-1">
              <ShellRegion className="bg-attention-200 text-attention-950">Sidebar</ShellRegion>
            </AppShellSidebarSlot>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel
            id="app-shell-collapsible-main"
            minSize={360}
            className="relative overflow-visible!"
          >
            <AppShellMainSlot className="flex h-full min-w-0 flex-1">
              <div className="flex size-full  flex-col bg-brand-100 text-brand-950">
                <header className="flex h-12 shrink-0 items-center gap-3 border-b border-line-strong px-3">
                  <SidebarTrigger />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wide">
                    Main
                  </span>
                </header>
                <ShellRegion className="flex-1">
                  Click the control to collapse the sidebar
                </ShellRegion>
              </div>
            </AppShellMainSlot>
          </ResizablePanel>
        </ResizableGroup>
      </AppShellRoot>
    </div>
  );
}
