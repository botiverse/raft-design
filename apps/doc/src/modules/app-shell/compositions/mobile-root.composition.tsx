import { AppShellRoot, AppShellSidebar } from "raft-ui/wip";

export function AppShellMobileRootComposition() {
  return (
    <AppShellRoot className="h-[360px] w-full max-w-sm">
      <AppShellSidebar className="flex h-full w-full md:flex">
        <div className="flex h-full min-h-0 w-full items-center justify-center bg-accent-200 px-4 text-center font-mono text-xs font-semibold uppercase tracking-wide text-accent-950">
          Sidebar · root view
        </div>
      </AppShellSidebar>
    </AppShellRoot>
  );
}
