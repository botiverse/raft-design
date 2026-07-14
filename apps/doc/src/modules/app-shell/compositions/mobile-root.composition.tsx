import { Home, Settings } from "lucide-react";
import { useState } from "react";
import { useThemeFamily } from "raft-ui";
import { cn } from "raft-ui/cn";
import {
  AppRailItem,
  AppRailItemIcon,
  AppRailItemLabel,
  AppRailNav,
  AppRailRoot,
  AppShellRail,
  AppShellRoot,
  AppShellSidebar,
} from "raft-ui/wip";

export function AppShellMobileRootComposition() {
  const [value, setValue] = useState("home");
  const theme = useThemeFamily();

  return (
    <AppShellRoot className={cn("h-dvh w-full", theme === "brutal" && "max-md:bg-white")}>
      <AppShellSidebar className="flex min-h-0 w-full flex-1 shrink">
        <div className="flex h-full min-h-0 w-full items-center justify-center bg-accent-200 px-4 text-center font-mono text-xs font-semibold uppercase tracking-wide text-accent-950">
          Sidebar · root view
        </div>
      </AppShellSidebar>
      <AppShellRail className="order-last max-md:flex max-md:h-auto max-md:w-full md:hidden">
        <AppRailRoot value={value} onValueChange={setValue}>
          <AppRailNav aria-label="Primary navigation">
            <AppRailItem value="home">
              <AppRailItemIcon>
                <Home />
              </AppRailItemIcon>
              <AppRailItemLabel>Home</AppRailItemLabel>
            </AppRailItem>
            <AppRailItem value="settings">
              <AppRailItemIcon>
                <Settings />
              </AppRailItemIcon>
              <AppRailItemLabel>Settings</AppRailItemLabel>
            </AppRailItem>
          </AppRailNav>
        </AppRailRoot>
      </AppShellRail>
    </AppShellRoot>
  );
}
