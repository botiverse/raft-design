import {
  NotificationCenter,
  NotificationCenterTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "raft-ui";
import {
  AppRailFooter,
  AppRailHeader,
  AppRailItem,
  AppRailItemIcon,
  AppRailItemLabel,
  AppRailNav,
  AppRailRoot,
  AppRailServerButton,
  AppRailUtilitySlot,
  AppShellRail,
} from "raft-ui/wip";
import {
  Activity,
  CheckSquare,
  MessageSquare,
  Monitor,
  Search,
  Settings,
  Users,
} from "lucide-react";

export function PlaygroundRail({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <AppShellRail className="flex md:flex">
      <AppRailRoot value={value} onValueChange={onValueChange}>
        <AppRailHeader>
          <AppRailServerButton aria-label="Switch server">D</AppRailServerButton>
        </AppRailHeader>
        <TooltipProvider delay={650}>
          <AppRailNav>
            <Tooltip>
              <TooltipTrigger render={<AppRailItem value="search" aria-label="Search" />}>
                <AppRailItemIcon>
                  <Search />
                </AppRailItemIcon>
                <AppRailItemLabel>Search</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Search</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<AppRailItem value="chat" aria-label="Chat" />}>
                <AppRailItemIcon>
                  <MessageSquare />
                </AppRailItemIcon>
                <AppRailItemLabel>Chat</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Chat</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<AppRailItem value="activity" aria-label="Activity" />}>
                <AppRailItemIcon>
                  <Activity />
                </AppRailItemIcon>
                <AppRailItemLabel>Activity</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Activity</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<AppRailItem value="tasks" aria-label="Tasks" />}>
                <AppRailItemIcon>
                  <CheckSquare />
                </AppRailItemIcon>
                <AppRailItemLabel>Tasks</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Tasks</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<AppRailItem value="members" aria-label="Members" />}>
                <AppRailItemIcon>
                  <Users />
                </AppRailItemIcon>
                <AppRailItemLabel>Members</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Members</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<AppRailItem value="computers" aria-label="Computers" />}>
                <AppRailItemIcon>
                  <Monitor />
                </AppRailItemIcon>
                <AppRailItemLabel>Computers</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Computers</TooltipContent>
            </Tooltip>
          </AppRailNav>
        </TooltipProvider>
        <TooltipProvider delay={650}>
          <AppRailUtilitySlot>
            <NotificationCenter modal={false}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <NotificationCenterTrigger type="button" aria-label="Notification center" />
                  }
                />
                <TooltipContent side="right">Notification center</TooltipContent>
              </Tooltip>
            </NotificationCenter>
          </AppRailUtilitySlot>
          <AppRailFooter>
            <Tooltip>
              <TooltipTrigger render={<AppRailItem value="settings" aria-label="Settings" />}>
                <AppRailItemIcon>
                  <Settings />
                </AppRailItemIcon>
                <AppRailItemLabel>Settings</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </AppRailFooter>
        </TooltipProvider>
      </AppRailRoot>
    </AppShellRail>
  );
}
