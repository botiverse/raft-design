// @docs-source-strip-start
import { Home, Settings } from "lucide-react";
import { useState } from "react";
import {
  AppShellMainSlot,
  AppShellRoot,
  MobileNavItem,
  MobileNavLabel,
  MobileNavRoot,
} from "raft-ui";
// @docs-source-strip-end

export function AppShellMobileRootComposition() {
  // @docs-source-strip-start
  const [value, setValue] = useState("home");
  // @docs-source-strip-end

  return (
    <AppShellRoot className="h-dvh w-full">
      <AppShellMainSlot>
        <div className="flex h-full min-h-0 w-full items-center justify-center bg-accent-200 px-4 text-center font-mono text-xs font-semibold uppercase tracking-wide text-accent-950">
          Sidebar · root view
        </div>
      </AppShellMainSlot>
      <MobileNavRoot className="order-last md:hidden" aria-label="Primary navigation">
        {/* ... */}
        {/* @docs-source-strip-start */}
        <MobileNavItem selected={value === "home"} onClick={() => setValue("home")}>
          <Home />
          <MobileNavLabel>Home</MobileNavLabel>
        </MobileNavItem>
        <MobileNavItem selected={value === "settings"} onClick={() => setValue("settings")}>
          <Settings />
          <MobileNavLabel>Settings</MobileNavLabel>
        </MobileNavItem>
        {/* @docs-source-strip-end */}
      </MobileNavRoot>
    </AppShellRoot>
  );
}
