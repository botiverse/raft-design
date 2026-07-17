import { PanelLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AppShellSidebarTrigger } from "raft-ui";

export function PlaygroundSidebarTrigger() {
  return (
    <AppShellSidebarTrigger>
      <PanelLeft className="group-data-[state=collapsed]/app-shell-sidebar-trigger:hidden group-hover/app-shell-sidebar-trigger:hidden" />
      <PanelLeftClose className="hidden group-hover/app-shell-sidebar-trigger:block group-data-[state=collapsed]/app-shell-sidebar-trigger:!hidden" />
      <PanelLeftOpen className="hidden group-data-[state=collapsed]/app-shell-sidebar-trigger:block" />
    </AppShellSidebarTrigger>
  );
}
