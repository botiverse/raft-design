import { PanelLeft } from "lucide-react";
import {
  AppRailItem,
  AppRailItemIcon,
  AppRailItemLabel,
  AppShellSidebarTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "raft-ui";

export function PlaygroundSidebarTrigger() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <AppShellSidebarTrigger render={<AppRailItem />}>
            <AppRailItemIcon>
              <PanelLeft />
            </AppRailItemIcon>
            <AppRailItemLabel>Toggle sidebar</AppRailItemLabel>
          </AppShellSidebarTrigger>
        }
      />
      <TooltipContent side="right">Toggle sidebar</TooltipContent>
    </Tooltip>
  );
}
