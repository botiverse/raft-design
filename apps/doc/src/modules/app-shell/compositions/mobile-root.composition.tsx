import { Home, Settings } from "lucide-react";
import { useState } from "react";
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

  return (
    <AppShellRoot safeAreaSurface="content" className="h-dvh w-full">
      <AppShellSidebar visibility="always" className="min-h-0 w-full flex-1 shrink">
        <div className="flex h-full min-h-0 w-full items-center justify-center bg-accent-200 px-4 text-center font-mono text-xs font-semibold uppercase tracking-wide text-accent-950">
          Sidebar · root view
        </div>
      </AppShellSidebar>
      <AppShellRail placement="bottom">
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
