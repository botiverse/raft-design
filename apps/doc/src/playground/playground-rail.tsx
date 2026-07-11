import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  NotificationCenter,
  NotificationCenterActionButton,
  NotificationCenterCount,
  NotificationCenterHeader,
  NotificationCenterItem,
  NotificationCenterItemActions,
  NotificationCenterItemBody,
  NotificationCenterItemContent,
  NotificationCenterItemIcon,
  NotificationCenterItemRow,
  NotificationCenterItemTitle,
  NotificationCenterList,
  NotificationCenterPopup,
  NotificationCenterScroller,
  NotificationCenterTitle,
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
import { Check } from "lucide-react";
import { useState } from "react";

const playgroundServers = [
  { id: "raft", name: "Raft", initial: "R" },
  { id: "design-guild", name: "Design Guild", initial: "D" },
  { id: "open-source", name: "Open Source", initial: "O" },
] as const;

export function PlaygroundRail() {
  const [value, setValue] = useState("chat");
  const [serverId, setServerId] =
    useState<(typeof playgroundServers)[number]["id"]>("design-guild");
  const [notificationVisible, setNotificationVisible] = useState(true);
  const activeServer = playgroundServers.find((server) => server.id === serverId)!;

  return (
    <AppShellRail>
      <AppRailRoot value={value} onValueChange={setValue}>
        <AppRailHeader>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <AppRailServerButton
                  aria-label={`Switch server. Current server: ${activeServer.name}`}
                />
              }
            >
              {activeServer.initial}
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="flex w-56 flex-col">
              {playgroundServers.map((server) => (
                <DropdownMenuItem key={server.id} onClick={() => setServerId(server.id)}>
                  <Check aria-hidden className={server.id === serverId ? undefined : "opacity-0"} />
                  <span className="min-w-0 flex-1 truncate text-left">{server.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
              <NotificationCenterPopup side="right" align="end">
                <NotificationCenterHeader>
                  <NotificationCenterTitle>Notifications</NotificationCenterTitle>
                  <NotificationCenterCount>
                    {notificationVisible ? "1 item" : "No items"}
                  </NotificationCenterCount>
                </NotificationCenterHeader>
                <NotificationCenterScroller>
                  {notificationVisible ? (
                    <NotificationCenterList>
                      <NotificationCenterItem>
                        <NotificationCenterItemRow>
                          <NotificationCenterItemIcon status="success" />
                          <NotificationCenterItemContent>
                            <NotificationCenterItemTitle>
                              Playground ready
                            </NotificationCenterItemTitle>
                            <NotificationCenterItemBody>
                              Component compositions are available for review.
                            </NotificationCenterItemBody>
                            <NotificationCenterItemActions>
                              <NotificationCenterActionButton
                                onClick={() => setNotificationVisible(false)}
                              >
                                Dismiss
                              </NotificationCenterActionButton>
                            </NotificationCenterItemActions>
                          </NotificationCenterItemContent>
                        </NotificationCenterItemRow>
                      </NotificationCenterItem>
                    </NotificationCenterList>
                  ) : null}
                </NotificationCenterScroller>
              </NotificationCenterPopup>
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
