import { Home, Settings } from "lucide-react";
import { useState } from "react";
import { useThemeFamily } from "raft-ui";
import { cn } from "raft-ui/cn";
import {
  AppShellRoot,
  AppShellSidebarSlot,
  MobileNavItem,
  MobileNavLabel,
  MobileNavRoot,
} from "raft-ui/wip";

export function AppShellMobileRootComposition() {
  const [value, setValue] = useState("home");
  const theme = useThemeFamily();

  return (
    <AppShellRoot className={cn("h-dvh w-full", theme === "brutal" && "max-md:bg-white")}>
      <AppShellSidebarSlot className="flex min-h-0 w-full flex-1 shrink">
        <div className="flex h-full min-h-0 w-full items-center justify-center bg-accent-200 px-4 text-center font-mono text-xs font-semibold uppercase tracking-wide text-accent-950">
          Sidebar · root view
        </div>
      </AppShellSidebarSlot>
      <MobileNavRoot className="order-last md:hidden" aria-label="Primary navigation">
        <MobileNavItem selected={value === "home"} onClick={() => setValue("home")}>
          <Home />
          <MobileNavLabel>Home</MobileNavLabel>
        </MobileNavItem>
        <MobileNavItem selected={value === "settings"} onClick={() => setValue("settings")}>
          <Settings />
          <MobileNavLabel>Settings</MobileNavLabel>
        </MobileNavItem>
      </MobileNavRoot>
    </AppShellRoot>
  );
}
