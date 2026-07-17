import type { ReactNode } from "react";
import { AppShellSidebarSlot } from "raft-ui";
import { cn } from "raft-ui/cn";

export function PlaygroundSidebarPresence({
  children,
  collapsed,
}: {
  children: ReactNode;
  collapsed: boolean;
}) {
  return (
    <div
      data-slot="playground-sidebar-motion"
      className={cn(
        [
          "h-full min-w-0 origin-left transform-gpu",
          "transition-[opacity,transform] duration-[220ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
          "motion-reduce:transition-none",
        ],
        collapsed && "pointer-events-none -translate-x-3 scale-[0.995] opacity-0",
      )}
    >
      <AppShellSidebarSlot
        aria-hidden={collapsed || undefined}
        className="relative flex h-full min-w-0 w-auto flex-1 shrink"
      >
        {children}
      </AppShellSidebarSlot>
    </div>
  );
}
