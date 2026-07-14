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
  AppRailItemAttention,
  AppRailItemIcon,
  AppRailItemIndicator,
  AppRailItemLabel,
  AppRailNav,
  AppRailRoot,
  AppRailServerButton,
  AppShellRail,
} from "raft-ui/wip";
import {
  Activity,
  CheckSquare,
  Home,
  MessageSquare,
  Monitor,
  Search,
  Settings,
  Users,
} from "lucide-react";

export function AppRailComposition() {
  return (
    <AppShellRail placement="responsive">
      <AppRailRoot value="chat">
        <AppRailHeader className="max-md:hidden">
          <AppRailServerButton
            title="Raft 中文社区"
            aria-label="Switch server (current: Raft 中文社区)"
          >
            <img
              alt=""
              src="https://cdn.slock.ai/avatars/server-46a34a4b-a324-4723-ad1d-4921b58ffe48/3f42727015df244421d70c681ff65093.webp"
            />
            <AppRailItemIndicator size="sm" aria-hidden />
          </AppRailServerButton>
        </AppRailHeader>
        <TooltipProvider delay={650}>
          <div className="hidden min-h-0 w-full flex-1 md:flex">
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
                    <AppRailItemAttention>
                      <Activity />
                    </AppRailItemAttention>
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
                    <AppRailItemAttention>
                      <Monitor />
                    </AppRailItemAttention>
                  </AppRailItemIcon>
                  <AppRailItemLabel>Computers</AppRailItemLabel>
                </TooltipTrigger>
                <TooltipContent side="right">Computers</TooltipContent>
              </Tooltip>
            </AppRailNav>
          </div>
          <AppRailFooter className="max-md:hidden">
            <NotificationCenter modal={false}>
              <NotificationCenterTrigger type="button" aria-label="Notification center" />
            </NotificationCenter>
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
          <div className="w-full md:hidden">
            <AppRailNav aria-label="Primary navigation">
              <AppRailItem value="chat" aria-label="Home">
                <AppRailItemIcon>
                  <Home />
                </AppRailItemIcon>
                <AppRailItemLabel>Home</AppRailItemLabel>
              </AppRailItem>
              <AppRailItem value="tasks" aria-label="Tasks">
                <AppRailItemIcon>
                  <CheckSquare />
                </AppRailItemIcon>
                <AppRailItemLabel>Tasks</AppRailItemLabel>
              </AppRailItem>
              <AppRailItem value="members" aria-label="Members">
                <AppRailItemIcon>
                  <Users />
                </AppRailItemIcon>
                <AppRailItemLabel>Members</AppRailItemLabel>
              </AppRailItem>
              <AppRailItem value="settings" aria-label="Settings">
                <AppRailItemIcon>
                  <Settings />
                </AppRailItemIcon>
                <AppRailItemLabel>Settings</AppRailItemLabel>
              </AppRailItem>
            </AppRailNav>
          </div>
        </TooltipProvider>
      </AppRailRoot>
    </AppShellRail>
  );
}
