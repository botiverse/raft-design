import { CircleHelp, MessageSquare, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  AppRailFooter,
  AppRailItem,
  AppRailItemIcon,
  AppRailItemLabel,
  AppRailNav,
  AppRailRoot,
  AppShellMainSlot,
  AppShellRailSlot,
  AppShellRoot,
  AppShellSidebarSlot,
  AppShellSidebarTrigger,
  Kbd,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@botiverse/raft-ui";

function Region({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div
      className={`flex size-full min-h-0 min-w-0 items-center justify-center px-2 text-center font-mono text-xs font-semibold uppercase tracking-wide ${className}`}
    >
      {children}
    </div>
  );
}

function RailItem({
  label,
  icon,
  value,
  view,
  onSelect,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  view: string;
  onSelect: (value: string) => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <AppRailItem
            selected={view === value}
            render={<button type="button" onClick={() => onSelect(value)} />}
          />
        }
      >
        <AppRailItemIcon>{icon}</AppRailItemIcon>
        <AppRailItemLabel>{label}</AppRailItemLabel>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

// The toggle is the first item of the rail's footer. The shell names it
// ("Collapse sidebar" / "Expand sidebar"); the tooltip repeats that name and
// shows the shortcut, so the native title is turned off.
function SidebarToggle({ open }: { open: boolean }) {
  const label = open ? "Collapse sidebar" : "Expand sidebar";
  return (
    <Tooltip>
      <AppShellSidebarTrigger
        render={<TooltipTrigger render={<AppRailItem />} />}
        title={undefined}
        aria-keyshortcuts="Meta+\"
      >
        <AppRailItemIcon>
          {open ? <PanelLeftClose aria-hidden /> : <PanelLeftOpen aria-hidden />}
        </AppRailItemIcon>
      </AppShellSidebarTrigger>
      <TooltipContent side="right" className="flex items-center gap-2">
        {label}
        <Kbd aria-label="Command backslash">⌘\</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}

export function AppShellRailTriggerComposition() {
  // The app keeps this value per device, so the sidebar comes back the way it was left.
  const [open, setOpen] = useState(true);
  const [view, setView] = useState("chat");

  return (
    <div className="w-full overflow-x-auto">
      <AppShellRoot
        sidebarCollapsible
        sidebarOpen={open}
        onSidebarOpenChange={setOpen}
        className="h-[420px] min-w-[860px]"
      >
        <AppShellRailSlot className="flex md:flex">
          <AppRailRoot>
            <TooltipProvider delay={650}>
              <AppRailNav>
                <RailItem
                  label="Chat"
                  value="chat"
                  view={view}
                  onSelect={setView}
                  icon={<MessageSquare />}
                />
              </AppRailNav>
              <AppRailFooter>
                <SidebarToggle open={open} />
                <RailItem
                  label="Help"
                  value="help"
                  view={view}
                  onSelect={setView}
                  icon={<CircleHelp />}
                />
                <RailItem
                  label="Settings"
                  value="settings"
                  view={view}
                  onSelect={setView}
                  icon={<Settings />}
                />
              </AppRailFooter>
            </TooltipProvider>
          </AppRailRoot>
        </AppShellRailSlot>

        <AppShellSidebarSlot className="relative flex w-60">
          <Region className="bg-attention-200 text-attention-950">Sidebar</Region>
        </AppShellSidebarSlot>

        <div className="relative flex min-w-0 flex-1">
          <AppShellMainSlot className="flex h-full min-w-0 flex-1">
            <Region className="bg-brand-100 text-brand-950">Main</Region>
          </AppShellMainSlot>
        </div>
      </AppShellRoot>
    </div>
  );
}
