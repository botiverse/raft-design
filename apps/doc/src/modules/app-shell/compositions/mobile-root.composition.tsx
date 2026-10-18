// @docs-source-strip-start
import { Home, Settings } from "lucide-react";
import { useCallback, useState } from "react";
import {
  AppShellMainSlot,
  AppShellRoot,
  MobileNavItem,
  MobileNavLabel,
  MobileNavRoot,
} from "@botiverse/raft-ui";
// @docs-source-strip-end

export function AppShellMobileRootComposition() {
  // @docs-source-strip-start
  const [value, setValue] = useState("home");

  const handleSelectHome = useCallback(() => {
    setValue("home");
  }, []);
  const handleSelectSettings = useCallback(() => {
    setValue("settings");
  }, []);
  // @docs-source-strip-end

  return (
    <AppShellRoot className="h-dvh w-full">
      <AppShellMainSlot>
        <div className="flex size-full min-h-0  items-center justify-center bg-attention-200 px-4 text-center font-mono text-xs font-semibold uppercase tracking-wide text-attention-950">
          Sidebar · root view
        </div>
      </AppShellMainSlot>
      <MobileNavRoot className="order-last md:hidden" aria-label="Primary navigation">
        {/* ... */}
        {/* @docs-source-strip-start */}
        <MobileNavItem selected={value === "home"} onClick={handleSelectHome}>
          <Home />
          <MobileNavLabel>Home</MobileNavLabel>
        </MobileNavItem>
        <MobileNavItem selected={value === "settings"} onClick={handleSelectSettings}>
          <Settings />
          <MobileNavLabel>Settings</MobileNavLabel>
        </MobileNavItem>
        {/* @docs-source-strip-end */}
      </MobileNavRoot>
    </AppShellRoot>
  );
}
