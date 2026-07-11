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
  MessageSquare,
  Monitor,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { Check } from "lucide-react";
import { useRef, useState } from "react";

import { isPlaygroundRailView, usePlaygroundNavigation } from "./playground-navigation-state.tsx";

const playgroundServers = [
  { id: "raft", name: "Raft", initial: "R" },
  { id: "design-guild", name: "Design Guild", initial: "D" },
  { id: "open-source", name: "Open Source", initial: "O" },
] as const;

export function PlaygroundRail() {
  const { railView, selectRailView } = usePlaygroundNavigation();
  const serverMenuAnchorRef = useRef<HTMLDivElement>(null);
  const [serverId, setServerId] =
    useState<(typeof playgroundServers)[number]["id"]>("design-guild");
  const [notificationVisible, setNotificationVisible] = useState(true);
  const activeServer = playgroundServers.find((server) => server.id === serverId)!;

  return (
    <AppShellRail>
      <AppRailRoot
        value={railView}
        onValueChange={(view) => {
          if (isPlaygroundRailView(view)) selectRailView(view);
        }}
      >
        <AppRailHeader ref={serverMenuAnchorRef}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <AppRailServerButton
                  aria-label={`Switch server. Current server: ${activeServer.name}`}
                />
              }
            >
              {activeServer.initial}
              <AppRailItemIndicator aria-hidden title="Other servers have unread messages" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              anchor={serverMenuAnchorRef}
              side="right"
              sideOffset={8}
              align="start"
              alignOffset={1}
              collisionPadding={4}
              className="flex w-64 flex-col"
            >
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
                  {railView !== "chat" ? (
                    <AppRailItemAttention title="Unread messages">
                      <MessageSquare />
                    </AppRailItemAttention>
                  ) : null}
                </AppRailItemIcon>
                <AppRailItemLabel>Chat</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Chat</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={<AppRailItem value="activity" aria-label="Activity" />}>
                <AppRailItemIcon>
                  <Activity />
                  {railView !== "activity" ? (
                    <AppRailItemAttention title="Unread activity">
                      <Activity />
                    </AppRailItemAttention>
                  ) : null}
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
                  {railView !== "computers" ? (
                    <AppRailItemAttention title="A managed computer has an upgrade available">
                      <Monitor />
                    </AppRailItemAttention>
                  ) : null}
                </AppRailItemIcon>
                <AppRailItemLabel>Computers</AppRailItemLabel>
              </TooltipTrigger>
              <TooltipContent side="right">Computers</TooltipContent>
            </Tooltip>
          </AppRailNav>
          <AppRailFooter>
            {notificationVisible ? (
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
                    <NotificationCenterCount>1 item</NotificationCenterCount>
                  </NotificationCenterHeader>
                  <NotificationCenterScroller>
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
                  </NotificationCenterScroller>
                </NotificationCenterPopup>
              </NotificationCenter>
            ) : null}
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
